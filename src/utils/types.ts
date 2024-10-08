import { Endpoints } from "@octokit/types";

export type UserResponse = Endpoints["GET /users/{username}"]["response"];
export type User = UserResponse["data"];

