'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {  Star, GitFork, Users } from 'lucide-react'
import { getUserProfile } from '@/actions'
import { OctokitResponse } from "@octokit/types";
import { User, UserResponse } from '@/utils/types'

type GitHubUser = {
  login: string
  name: string
  public_repos: number
  avatar_url: string
  followers: number
  public_gists: number
}

export default function Home() {
  const [username, setUsername] = useState('')
  const [aura, setAura] = useState<number | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const calculateAura = (user: User) => {
    // This is a simple calculation, you can make it more complex
    return user.public_repos * 3 + user.followers * 2 + user.public_gists * 1
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setAura(null)
    setUser(null)

    try {
      const userData = await getUserProfile(username)
      console.log(userData);
      setUser(userData)
      setAura(calculateAura(userData))
    } catch (err) {
      setError('Yo, that user doesn\'t exist or something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">GitHub Aura Vibe Check</CardTitle>
          <CardDescription className="text-center">Enter a GitHub username to calculate their aura, fam!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="GitHub username"
                className="flex-grow"
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Checking...' : 'Check Aura'}
              </Button>
            </div>
          </form>

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}

          {user && aura !== null && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <img src={user.avatar_url} alt={user.name} className="w-16 h-16 rounded-full" />
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-500">@{user.login}</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white text-center py-4 rounded-lg">
                <p className="text-3xl font-bold">Aura Score: {aura}</p>
                <p>That's {aura > 1000 ? 'legendary' : aura > 500 ? 'fire' : 'cool'}, bro!</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <GitFork className="mx-auto h-6 w-6 text-gray-400" />
                  <p className="mt-1 font-semibold">{user.public_repos}</p>
                  <p className="text-xs text-gray-500">Repos</p>
                </div>
                <div>
                  <Users className="mx-auto h-6 w-6 text-gray-400" />
                  <p className="mt-1 font-semibold">{user.followers}</p>
                  <p className="text-xs text-gray-500">Followers</p>
                </div>
                <div>
                  <Star className="mx-auto h-6 w-6 text-gray-400" />
                  <p className="mt-1 font-semibold">{user.public_gists}</p>
                  <p className="text-xs text-gray-500">Gists</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
