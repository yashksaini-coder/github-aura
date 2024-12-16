import React from "react";
import {
  Book,
  Users,
  FileCode,
  GitFork,
  Star,
  Flame,
  AlertCircle,
  CheckCircle,
  GitPullRequest,
  Calendar,
  Share2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuraParams } from "@/utils/types";
import { BASE_URL } from "@/utils/url";

interface AuraStatsProps {
  username: string;
  auraParams: AuraParams;
  auraScore: number;
}

export const AuraStats = ({
  username,
  auraParams,
  auraScore,
}: AuraStatsProps) => {
  const topLanguages = Object.entries(auraParams.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang)
    .join(", ");

  const shareOnTwitter = () => {
    const text = `Check out my GitHub Aura! My score is ${auraScore.toFixed(2)}. Calculate yours at ${BASE_URL}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white">
      <CardHeader className="pb-0">
        <CardTitle className="text-2xl font-bold text-center">
          GitHub Aura: {username}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 p-6">
        <div className="col-span-2 flex justify-center items-center mb-4">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-white opacity-20"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="44"
                cx="50"
                cy="50"
              />
              <circle
                className="text-white"
                strokeWidth="8"
                strokeDasharray={`${auraScore * 2.76} 276`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="44"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold">
              {auraScore.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Book className="w-5 h-5 mr-2" />
            <span>Repos: {auraParams.repoCount}</span>
          </div>
          <div className="flex items-center">
            <FileCode className="w-5 h-5 mr-2" />
            <span>Top Languages: {topLanguages}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            <span>Followers: {auraParams.followers}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            <span>Following: {auraParams.following}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <GitFork className="w-5 h-5 mr-2" />
            <span>Forks: {auraParams.totalForks}</span>
          </div>
          <div className="flex items-center">
            <Star className="w-5 h-5 mr-2" />
            <span>Stars: {auraParams.totalStars}</span>
          </div>
          <div className="flex items-center">
            <Flame className="w-5 h-5 mr-2" />
            <span>Streak: {auraParams.streak} days</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            <span>Contributions: {auraParams.contributionCount}</span>
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Issues Opened: {auraParams.issuesOpened}</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Issues Closed: {auraParams.issuesClosed}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <GitPullRequest className="w-5 h-5 mr-2" />
              <span>PRs Opened: {auraParams.prsOpened}</span>
            </div>
            <div className="flex items-center">
              <GitPullRequest className="w-5 h-5 mr-2" />
              <span>PRs Closed: {auraParams.prsClosed}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-black bg-opacity-30 flex justify-between items-center">
        <span className="text-sm opacity-75">GitHub Aura Calculator</span>
        <Button
          onClick={shareOnTwitter}
          variant="secondary"
          size="sm"
          className="flex items-center"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share on Twitter
        </Button>
      </CardFooter>
    </Card>
  );
};
