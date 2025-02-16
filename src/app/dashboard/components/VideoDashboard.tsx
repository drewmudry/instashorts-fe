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
import { VideoList, CreateVideoRequest } from '@/types/videos'

export function VideosDashboard() {
  const [videos, setVideos] = useState<VideoList[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [topic, setTopic] = useState('')
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
        const data: VideoList[] = await response.json()
        setVideos(data)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const videoData: CreateVideoRequest = {
      topic,
      voice,
    }

    try {
      const response = await fetch('http://localhost:8000/videos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(videoData),
      })

      if (response.ok) {
        setIsOpen(false)
        setTopic('')
        setVoice('')
        fetchVideos()
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
                <label className="text-sm font-medium">Topic</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter video topic"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Voice Style</label>
                <Input
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  placeholder="Enter voice style"
                  className="mt-1"
                  required
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
              <CardTitle>{video.title || video.topic}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Status: {video.creation_status}</p>
              <p className="text-sm text-gray-500">
                Created: {new Date(video.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">Voice: {video.voice}</p>
              <p className="text-sm text-gray-500 mt-2">Topic: {video.topic}</p>
              {video.final_url && (
                <Button variant="outline" className="mt-2" asChild>
                  <a href={video.final_url} target="_blank" rel="noopener noreferrer">
                    View Video
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}