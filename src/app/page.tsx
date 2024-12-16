"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchGitHubAura } from "@/actions";
import { AuraParams, User } from "@/utils/types";
import { UsernameInput } from "@/components/username-input";
import { AuraStats } from "@/components/aura-stats";
import { calculateAuraScore } from "@/utils/aura-calculator";

export async function getUserAura(username: string) {
  const auraParams = await fetchGitHubAura(username);
  const auraScore = calculateAuraScore(auraParams);
  return { params: auraParams, score: auraScore };
}

export default function Home() {
  const [aura, setAura] = useState<{
    params: AuraParams;
    score: number;
  } | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (username: string) => {
    setLoading(true);
    setError("");
    setAura(null);
    setUsername(username);

    try {
      const aura = await getUserAura(username);
      setAura(aura);
    } catch (err) {
      setError("Yo, that user doesn't exist or something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            GitHub Aura Check
          </CardTitle>
          <CardDescription className="text-center">
            Enter a GitHub username to calculate their aura, fam!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsernameInput onSubmit={handleSubmit} />

          {username && aura !== null && (
            <AuraStats
              username={username}
              auraParams={aura.params}
              auraScore={aura.score}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
