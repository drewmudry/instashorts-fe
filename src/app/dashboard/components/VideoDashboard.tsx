'use client';

import { useEffect, useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { VideoList, VideoRequest, VideoStatus } from '@/types/videos';
import { UserContext } from '@/context/UserContext';

const STATUS_PROGRESS: Record<VideoStatus, number> = {
  [VideoStatus.PENDING]: 0,
  [VideoStatus.GENERATING_SCRIPT]: 10,
  [VideoStatus.SCRIPT_COMPLETE]: 20,
  [VideoStatus.GENERATING_VOICE]: 30,
  [VideoStatus.VOICE_COMPLETE]: 40,
  [VideoStatus.GENERATING_PROMPTS]: 50,
  [VideoStatus.PROMPTS_COMPLETE]: 60,
  [VideoStatus.GENERATING_IMAGES]: 70,
  [VideoStatus.IMAGES_COMPLETE]: 80,
  [VideoStatus.COMPILING]: 90,
  [VideoStatus.COMPLETED]: 100,
  [VideoStatus.FAILED]: 0,
};

const useVideoStatusUpdates = (videos: VideoList[], setVideos: React.Dispatch<React.SetStateAction<VideoList[]>>) => {
  const [connections, setConnections] = useState<{ [key: string]: EventSource }>({});
  const context = useContext(UserContext); // Get the context
  const user = context?.user; // Access user safely using optional chaining
  const userLoading = context?.isLoading; // Access isLoading safely

  useEffect(() => {
    if (user) {
      videos.forEach((video) => {
        if (![VideoStatus.COMPLETED, VideoStatus.FAILED].includes(video.creation_status) && !connections[video.id]) {
          const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/videos/${video.id}/status`, { withCredentials: true });
          eventSource.onmessage = (event) => {
            try {
              const updatedVideo = JSON.parse(event.data);
              setVideos((prevVideos) =>
                prevVideos.map((v) => (v.id === updatedVideo.id ? { ...v, ...updatedVideo } : v))
              );

              if ([VideoStatus.COMPLETED, VideoStatus.FAILED].includes(updatedVideo.creation_status)) {
                eventSource.close();
                setConnections((prev) => {
                  const newConnections = { ...prev };
                  delete newConnections[video.id];
                  return newConnections;
                });
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          };

          eventSource.onerror = (error) => {
            console.error('SSE error for video', video.id, ':', error);
            eventSource.close();
            setConnections((prev) => {
              const newConnections = { ...prev };
              delete newConnections[video.id];
              return newConnections;
            });
          };

          setConnections((prev) => ({
            ...prev,
            [video.id]: eventSource,
          }));
        }
      });
    }

    return () => {
      Object.values(connections).forEach((es) => es.close());
      setConnections({});
    };
  }, [videos, user]);
};

export default function VideosDashboard() {
  const [videos, setVideos] = useState<VideoList[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [voice, setVoice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const context = useContext(UserContext);
  const user = context?.user;
  const userLoading = context?.isLoading;

  useVideoStatusUpdates(videos, setVideos);

  useEffect(() => {
    const fetchVideos = async () => {
      if (user) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/videos/`, {
            credentials: 'include',
          });
          if (response.ok) {
            const data: VideoList[] = await response.json();
            setVideos(data);
          } else {
            console.error('Error fetching videos:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching videos:', error);
        }
      }
    };

    fetchVideos();
  }, [user]);

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const videoData: VideoRequest = {
      topic,
      voice,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/videos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(videoData),
      });

      if (response.ok) {
        const newVideo = await response.json();
        setVideos((prev) => [...prev, newVideo]);
        setIsOpen(false);
        setTopic('');
        setVoice('');
      } else {
        console.error('Error creating video:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: VideoStatus) => {
    if (status === VideoStatus.COMPLETED) return 'text-green-600';
    if (status === VideoStatus.FAILED) return 'text-red-600';
    return 'text-blue-600';
  };

  if (userLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your videos.</div>;
  }

  const showProgress = (status: VideoStatus) => {
    return status !== VideoStatus.FAILED && status !== VideoStatus.COMPLETED;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">AI Videos</h2>
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Video'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="relative">
            <CardHeader>
              <CardTitle>{video.title || video.topic}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className={`text-sm font-medium ${getStatusColor(video.creation_status)}`}>
                    {video.creation_status}
                  </p>
                  {showProgress(video.creation_status) && (
                    <Progress
                      value={STATUS_PROGRESS[video.creation_status] || 0}
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Created: {new Date(video.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">Voice: {video.voice}</p>
                  <p className="text-sm text-gray-500">Topic: {video.topic}</p>
                  {video.audio_url && (
                  <p className="text-sm text-gray-500">audio: {video.audio_url}</p>
                )}
                </div>
                {video.final_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={video.final_url} target="_blank" rel="noopener noreferrer">
                      View Video
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}