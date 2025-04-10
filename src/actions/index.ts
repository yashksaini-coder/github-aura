"use server";

import { octokit } from "@/lib/octokit";
import { AuraParams, Events, Issues, Repos } from "@/utils/types";

// Cache for storing results to avoid repeated API calls
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache
const userCache = new Map<string, { data: AuraParams; timestamp: number }>();

export async function fetchGitHubAura(username: string): Promise<AuraParams> {
  // Check cache first
  const cachedData = userCache.get(username);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION_MS) {
    return cachedData.data;
  }

  try {
    // Basic user info - essential data
    const userInfo = await octokit.request("GET /users/{username}", {
      username,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    // Get repositories with sampling for large profiles
    const repoData = await fetchRepositoriesSafely(username);
    const repos = repoData.repos;
    const hasMoreRepoPages = repoData.hasMore;

    // Calculate total stars and forks
    const totalStars = repos.reduce(
      (sum, repo) => sum + (repo.stargazers_count ? repo.stargazers_count : 0),
      0,
    );
    const totalForks = repos.reduce(
      (sum, repo) => sum + (repo.forks_count ? repo.forks_count : 0),
      0,
    );

    // Get languages with sampling for large profiles
    const languages = await fetchLanguagesSafely(username, repos);

    // Get issues and PRs with safer pagination and sampling
    const { issuesOpened, issuesClosed, prsOpened, prsClosed } = 
      await fetchIssuesAndPRsSafely(username);

    // Get contribution data with less API intensive approach
    const { streak, contributionCount } = 
      await fetchContributionDataSafely(username);

    // Create the final parameter object
    const auraParams: AuraParams = {
      repoCount: hasMoreRepoPages ? userInfo.data.public_repos : repos.length,
      languages,
      followers: userInfo.data.followers,
      following: userInfo.data.following,
      gists: userInfo.data.public_gists,
      totalForks,
      totalStars,
      streak,
      issuesOpened,
      issuesClosed,
      prsOpened,
      prsClosed,
      contributionCount,
    };

    // Cache the result
    userCache.set(username, { data: auraParams, timestamp: Date.now() });
    return auraParams;
  } catch (error: any) {
    // Handle rate limiting explicitly
    if (error.status === 403 && error.response?.headers?.['x-ratelimit-remaining'] === '0') {
      throw new Error("GitHub API rate limit exceeded. Please try again later.");
    }
    
    throw error;
  }
}

// Fetches repositories with protection against rate limits
async function fetchRepositoriesSafely(username: string, maxPages = 3): Promise<{ repos: Repos; hasMore: boolean }> {
  let repos: Repos = [];
  let page = 1;
  let hasMore = false;

  try {
    while (page <= maxPages) {
      const reposResponse = await octokit.request("GET /users/{username}/repos", {
        username,
        per_page: 100,
        page,
        sort: "updated", // Get the most recent repositories
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (reposResponse.data.length === 0) {
        break;
      }

      repos = [...repos, ...reposResponse.data];
      page++;
      
      // Check if we have more pages but we're limiting ourselves
      if (reposResponse.data.length === 100 && page > maxPages) {
        hasMore = true;
        break;
      }
    }

    return { repos, hasMore };
  } catch (error) {
    // If we hit rate limits, return what we have so far
    console.error("Error fetching repositories:", error);
    return { repos, hasMore: true };
  }
}

// Fetches languages with sampling for large profiles
async function fetchLanguagesSafely(username: string, repos: Repos): Promise<Record<string, number>> {
  const languages: Record<string, number> = {};
  
  // For large profiles, sample only a subset of repositories (most starred or recently updated)
  const reposToSample = repos
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 10); // Sample top 10 most starred repos
  
  for (const repo of reposToSample) {
    try {
      const repoLanguages = await octokit.request(
        "GET /repos/{owner}/{repo}/languages",
        {
          owner: username,
          repo: repo.name,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      );

      Object.entries(repoLanguages.data).forEach(([lang, bytes]) => {
        languages[lang] = (languages[lang] || 0) + (bytes as number);
      });
    } catch (error) {
      // Continue with other repos even if one fails
      console.error(`Error fetching languages for ${repo.name}:`, error);
    }
  }
  
  return languages;
}

// Fetches issues and PRs safely with pagination limits
async function fetchIssuesAndPRsSafely(username: string): Promise<{ 
  issuesOpened: number; 
  issuesClosed: number; 
  prsOpened: number; 
  prsClosed: number; 
}> {
  try {
    // We'll use search API more efficiently
    const issuesOpenedCount = await getIssueCountSafely(username, "is:issue is:open");
    const issuesClosedCount = await getIssueCountSafely(username, "is:issue is:closed");
    const prsOpenedCount = await getIssueCountSafely(username, "is:pr is:open");
    const prsClosedCount = await getIssueCountSafely(username, "is:pr is:closed");
    
    return {
      issuesOpened: issuesOpenedCount,
      issuesClosed: issuesClosedCount,
      prsOpened: prsOpenedCount,
      prsClosed: prsClosedCount,
    };
  } catch (error) {
    console.error("Error fetching issues and PRs:", error);
    return {
      issuesOpened: 0,
      issuesClosed: 0,
      prsOpened: 0,
      prsClosed: 0,
    };
  }
}

// Helper to get issue counts without fetching all results
async function getIssueCountSafely(username: string, qualifier: string): Promise<number> {
  try {
    const query = `author:${username} ${qualifier}`;
    const response = await octokit.request("GET /search/issues", {
      q: query,
      per_page: 1, // We only need the total count
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    
    return response.data.total_count;
  } catch (error) {
    console.error(`Error fetching issue count for ${qualifier}:`, error);
    return 0;
  }
}

// Gets contribution data safely
async function fetchContributionDataSafely(username: string): Promise<{ 
  streak: number; 
  contributionCount: number; 
}> {
  try {
    // Get recent events with a limit
    const events: Events = await octokit.request("GET /users/{username}/events", {
      username,
      per_page: 100, // Max allowed
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    // Calculate streak based on recent events
    const eventDays = new Set();
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    let contributionCount = 0;
    events.data.forEach((event) => {
      if (event.created_at) {
        const eventDate = new Date(event.created_at);
        const dateStr = eventDate.toISOString().split("T")[0];
        eventDays.add(dateStr);
        contributionCount++;
      }
    });

    // For senior devs, we'll use the event data as a sample
    // and extrapolate if needed based on their profile age
    const firstEvent = events.data.length > 0 ? events.data[0] : null;
    const userCreatedAt = firstEvent && firstEvent.created_at 
      ? new Date(firstEvent.created_at) 
      : now;
    const daysActive = Math.max(1, Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Estimate streak - for long-time users, we'll use a more generous estimation
    // since GitHub API only shows recent events
    const streak = Math.min(eventDays.size, 30); // Cap at 30 days since we can only see recent activity
    
    return {
      streak,
      contributionCount: contributionCount > 0 ? contributionCount : 0,
    };
  } catch (error) {
    console.error("Error fetching contribution data:", error);
    return {
      streak: 0,
      contributionCount: 0,
    };
  }
}
