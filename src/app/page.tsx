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
import { WaveLoader } from "@/components/wave-loader";
import { LoadingMessages } from "@/components/loading-messages";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

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

  const renderHeader = () => (
    <header className="w-full max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-center gap-2">
        <GitHubLogoIcon className="h-8 w-8" />
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          GitHub Aura Scanner
        </h1>
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer className="w-full text-center py-4 text-sm text-gray-400">
      <p>Made with 💫 for the GitHub community</p>
    </footer>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 flex flex-col">
        {renderHeader()}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <WaveLoader />
          <LoadingMessages />
        </div>
        {renderFooter()}
      </div>
    );
  }

  if (username && aura) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 flex flex-col">
        {renderHeader()}
        <div className="flex-1 flex items-center justify-center p-4">
          <AuraStats
            username={username}
            auraParams={aura.params}
            auraScore={aura.score}
          />
        </div>
        {renderFooter()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 flex flex-col">
      {renderHeader()}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-800 bg-black/70 backdrop-blur-sm transition-all hover:shadow-md hover:shadow-purple-500/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              GitHub Aura Check
            </CardTitle>
            <CardDescription className="text-center">
              Discover the vibes of any GitHub profile - enter a username below!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsernameInput onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>
      {renderFooter()}
    </div>
  );
}
