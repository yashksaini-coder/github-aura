import { fetchGitHubAura } from "@/actions";
import { AuraParams } from "./types";

export async function getUserAura(username: string) {
  const auraParams = await fetchGitHubAura(username);
  const auraScore = calculateAuraScore(auraParams);
  return { params: auraParams, score: auraScore };
}


export function calculateAuraScore(params: AuraParams): number {
  // Base scores
  const repoScore = Math.min(params.repoCount * 2, 20); // Max 20 points

  // Language diversity score (number of languages used)
  const languageScore = Math.min(Object.keys(params.languages).length * 3, 15); // Max 15 points

  // Social score
  const followerScore = Math.min(Math.log10(params.followers + 1) * 5, 10); // Max 10 points
  const followingScore = Math.min(Math.log10(params.following + 1) * 2, 5); // Max 5 points

  // Activity scores
  const gistScore = Math.min(params.gists, 5); // Max 5 points
  const forkScore = Math.min(Math.log10(params.totalForks + 1) * 3, 10); // Max 10 points
  const starScore = Math.min(Math.log10(params.totalStars + 1) * 4, 15); // Max 15 points

  // Streak and contribution scores
  const streakScore = Math.min(params.streak / 7, 10); // Max 10 points
  const contributionScore = Math.min(
    Math.log10(params.contributionCount + 1) * 3,
    10,
  ); // Max 10 points

  // Issue and PR scores
  const issueScore = Math.min(
    (params.issuesOpened + params.issuesClosed) / 10,
    10,
  ); // Max 10 points
  const prScore = Math.min((params.prsOpened + params.prsClosed) / 5, 15); // Max 15 points

  // Calculate total (max possible: 125 points)
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
