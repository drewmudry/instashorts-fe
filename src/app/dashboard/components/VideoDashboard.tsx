'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Video {
  id: string
  title: string
  status: string
  created_at: string
  description?: string
}

export function VideosDashboard() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState('')
  const [voice, setVoice] = useState('')

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('http://localhost:8000/videos/', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/videos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: theme, // Using theme as title for now
          description: `Voice style: ${voice}`,
        }),
      })

      if (response.ok) {
        setIsOpen(false)
        setTheme('')
        setVoice('')
        fetchVideos() // Refresh the video list
      }
    } catch (error) {
      console.error('Error creating video:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Videos</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Create New Video</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Video</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateVideo} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <Input
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Enter video theme"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Voice Style</label>
                <Input
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  placeholder="Enter voice style"
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                Create Video
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardHeader>
              <CardTitle>{video.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Status: {video.status}</p>
              <p className="text-sm text-gray-500">
                Created: {new Date(video.created_at).toLocaleDateString()}
              </p>
              {video.description && (
                <p className="text-sm text-gray-500 mt-2">{video.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}