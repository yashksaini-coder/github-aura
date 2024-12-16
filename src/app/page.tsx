"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuraParams } from "@/utils/types";
import { UsernameInput } from "@/components/username-input";
import { AuraStats } from "@/components/aura-stats";
import { useToast } from "@/hooks/use-toast";
import { getUserAura } from "@/utils/aura-calculator";

export default function Home() {
  const { toast } = useToast();
  const [aura, setAura] = useState<{
    params: AuraParams;
    score: number;
  } | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (username: string) => {
    try {
      setLoading(true);
      setUsername(username);
      const aura = await getUserAura(username);
      setAura(aura);
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error!",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
