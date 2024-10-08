import { Octokit } from "octokit";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN as string;

if (!GITHUB_TOKEN) {
  throw new Error("NO GITHUB TOKEN SAAR, WHAT THE HELL ARE YOU DOING")
}

export const octokit = new Octokit({
  auth: GITHUB_TOKEN
})
