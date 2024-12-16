"use server";

import { octokit } from "@/lib/octokit";
import { AuraParams, Issues, Repos } from "@/utils/types";

export async function getUserProfile(username: string) {
  const res = await octokit.request("GET /users/{username}", {
    username,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const test = await getStats(username, "events/public");

  console.log(test);

  return res.data;
}

export async function getStats(username: string, stat: string) {
  const res = await octokit.request(`GET /users/{username}/${stat}`, {
    username,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return res.data;
}

export async function fetchGitHubAura(username: string): Promise<AuraParams> {
  // Basic user info
  const userInfo = await octokit.request("GET /users/{username}", {
    username,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  // Get all repositories
  let repos: Repos = [];
  let page = 1;
  let hasMoreRepos = true;

  while (hasMoreRepos) {
    const reposResponse = await octokit.request("GET /users/{username}/repos", {
      username,
      per_page: 100,
      page,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    console.log(reposResponse.data);

    if (reposResponse.data.length === 0) {
      hasMoreRepos = false;
    } else {
      repos = [...repos, ...reposResponse.data];
      page++;
    }
  }

  // Calculate total stars and forks
  const totalStars = repos.reduce(
    (sum, repo) => sum + (repo.stargazers_count ? repo.stargazers_count : 0),
    0,
  );
  const totalForks = repos.reduce(
    (sum, repo) => sum + (repo.forks_count ? repo.forks_count : 0),
    0,
  );

  // Get languages for all repos
  const languages: Record<string, number> = {};
  for (const repo of repos) {
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
      languages[lang] = (languages[lang] || 0) + bytes;
    });
  }

  // Get issues and PRs
  let issues: Issues = [];
  page = 1;
  let hasMoreIssues = true;

  while (hasMoreIssues) {
    const issuesResponse = await octokit.request("GET /search/issues", {
      q: `author:${username}`,
      per_page: 100,
      page,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (issuesResponse.data.items.length === 0) {
      hasMoreIssues = false;
    } else {
      issues = [...issues, ...issuesResponse.data.items];
      page++;
    }
  }

  const issuesOpened = issues.filter((issue) => !issue.pull_request).length;
  const issuesClosed = issues.filter(
    (issue) => !issue.pull_request && issue.state === "closed",
  ).length;
  const prsOpened = issues.filter((issue) => issue.pull_request).length;
  const prsClosed = issues.filter(
    (issue) => issue.pull_request && issue.state === "closed",
  ).length;

  // Streaks using recent events
  const events = await octokit.request("GET /users/{username}/events", {
    username,
    per_page: 100,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  // Calculate streak based on recent events
  const eventDays = new Set();
  events.data.forEach((event: any) => {
    const date = new Date(event.created_at).toISOString().split("T")[0];
    eventDays.add(date);
  });

  const streak = eventDays.size; // This is an approximation
  const contributionCount = events.data.length; // This is also an approximation

  return {
    repoCount: repos.length,
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
}
