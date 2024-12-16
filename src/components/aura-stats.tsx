import React from "react";
import {
  Book,
  Users,
  Calendar,
  AlertCircle,
  FileCode,
  GitFork,
  Star,
  GitPullRequest,
  Share2,
  Flame,
  LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    const text = `My GitHub Aura Score: ${auraScore.toFixed(1)}/100\n\n${topLanguages} Developer\n${auraParams.totalStars} ⭐ · ${auraParams.followers} Followers\n\nCheck yours at ${BASE_URL}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const StatItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: LucideIcon;
    label: string;
    value: string | number;
  }) => (
    <div className="flex items-center space-x-2 text-sm">
      <Icon className="w-4 h-4 text-gray-500" />
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">GitHub Aura Score</p>
            <CardTitle className="text-3xl font-bold">
              {auraScore.toFixed(1)}
              <span className="text-lg text-gray-400 ml-1">/100</span>
            </CardTitle>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Developer</p>
            <p className="font-medium text-lg">{username}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatItem
              icon={FileCode}
              label="Top Languages"
              value={topLanguages}
            />
            <StatItem
              icon={Book}
              label="Repositories"
              value={auraParams.repoCount}
            />
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <StatItem
              icon={Users}
              label="Followers"
              value={auraParams.followers.toLocaleString()}
            />
            <StatItem
              icon={Users}
              label="Following"
              value={auraParams.following.toLocaleString()}
            />
            <StatItem
              icon={Star}
              label="Total Stars"
              value={auraParams.totalStars.toLocaleString()}
            />
            <StatItem
              icon={GitFork}
              label="Total Forks"
              value={auraParams.totalForks.toLocaleString()}
            />
          </div>

          <div className="space-y-4">
            <StatItem
              icon={Flame}
              label="Streak"
              value={`${auraParams.streak} days`}
            />
            <StatItem
              icon={Calendar}
              label="Contributions"
              value={auraParams.contributionCount.toLocaleString()}
            />
            <StatItem
              icon={AlertCircle}
              label="Issues"
              value={`${auraParams.issuesOpened} opened, ${auraParams.issuesClosed} closed`}
            />
            <StatItem
              icon={GitPullRequest}
              label="Pull Requests"
              value={`${auraParams.prsOpened} opened, ${auraParams.prsClosed} closed`}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-6">
        <div className="w-full flex items-center justify-between">
          <div className="text-xs text-gray-400">
            <p>github-aura.vercel.app</p>
            <p className="mt-1">Based on public GitHub data</p>
          </div>
          <Button
            onClick={shareOnTwitter}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
