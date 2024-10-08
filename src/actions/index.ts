"use server";

import { octokit } from "@/lib/octokit";

export async function getUserProfile(username: string) {
  const res = await octokit.request("GET /users/{username}", {
    username,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return res.data;
}
