import { Endpoints } from "@octokit/types";

export type User = Endpoints["GET /users/{username}"]["response"]["data"];
export type Repos = Endpoints["GET /users/{username}/repos"]["response"]["data"];
export type Issues = Endpoints["GET /search/issues"]["response"]["data"]["items"];
export type Events = Endpoints["GET /users/{username}/events"]["response"];

export type AuraParams = {
  repoCount: number;
  languages: Record<string, number>;
  followers: number;
  following: number;
  gists: number;
  totalForks: number;
  totalStars: number;
  streak: number;
  issuesOpened: number;
  issuesClosed: number;
  prsOpened: number;
  prsClosed: number;
  contributionCount: number;
};
