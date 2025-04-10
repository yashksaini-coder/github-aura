import { fetchGitHubAura } from "@/actions";
import { AuraParams } from "./types";

export async function getUserAura(username: string) {
  const auraParams = await fetchGitHubAura(username);
  const auraScore = calculateAuraScore(auraParams);
  return { params: auraParams, score: auraScore };
}

export function calculateAuraScore(params: AuraParams): number {
  // Base scores with better scaling for senior developers
  const repoScore = Math.min(Math.log10(params.repoCount + 1) * 10, 20); // Max 20 points, logarithmic scale

  // Language diversity score (number of languages used)
  const languageCount = Object.keys(params.languages).length;
  const languageScore = Math.min(Math.log10(languageCount + 1) * 10, 15); // Max 15 points, logarithmic scale

  // Social score with better logarithmic scaling
  const followerScore = Math.min(Math.log10(params.followers + 1) * 5, 15); // Max 15 points, logarithmic scale
  const followingScore = Math.min(Math.log10(params.following + 1) * 2, 5); // Max 5 points, logarithmic scale

  // Activity scores with better logarithmic scaling
  const gistScore = Math.min(Math.log10(params.gists + 1) * 3, 5); // Max 5 points, logarithmic scale
  const forkScore = Math.min(Math.log10(params.totalForks + 1) * 4, 10); // Max 10 points, logarithmic scale
  const starScore = Math.min(Math.log10(params.totalStars + 1) * 5, 15); // Max 15 points, logarithmic scale

  // Streak and contribution scores with better scaling
  const streakScore = Math.min(Math.log10(params.streak + 1) * 7, 10); // Max 10 points, logarithmic scale
  const contributionScore = Math.min(
    Math.log10(params.contributionCount + 1) * 5,
    10,
  ); // Max 10 points, logarithmic scale

  // Issue and PR scores with better scaling for senior developers
  const issueCount = params.issuesOpened + params.issuesClosed;
  const prCount = params.prsOpened + params.prsClosed;
  
  const issueScore = Math.min(Math.log10(issueCount + 1) * 5, 10); // Max 10 points, logarithmic scale
  const prScore = Math.min(Math.log10(prCount + 1) * 7, 15); // Max 15 points, logarithmic scale

  // Calculate total (max possible: 130 points)
  const totalScore =
    repoScore +
    languageScore +
    followerScore +
    followingScore +
    gistScore +
    forkScore +
    starScore +
    streakScore +
    contributionScore +
    issueScore +
    prScore;

  // Normalize to 0-100 scale
  return Math.min(Math.round(totalScore * 0.8), 100);
}
