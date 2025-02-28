'use client';

import { useEffect, useState, useContext, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { VideoList, VideoRequest, VideoStatus } from '@/types/videos';
import { UserContext } from '@/context/UserContext';
import { Play, Pause } from 'lucide-react';

// Voice mapping dictionary
const VOICE_CODE_DICT = {
  "Adam": "pNInz6obpgDQGcFmaJgB",
  "Brian": "nPczCjzI2devNBz1zQrb",
  "Nicole": "piTKgcLEGmPE4e6mEKli",
  "Clyde": "2EiwWnXFnvU5JabPnv8n",
  "Dorothy": "ThT5KcBeYPX3keUQqHPh",
  "Drew": "29vD33N1CtxCmqQRPOHJ",
  "Freya": "jsCqWAovK2LkecY7zXl4",
  "James": "ZQe5CZNOzWyzPSCn5a3c",
  "Jessica": "cgSgspJ2msm6clMCkdW9",
  "Sarah": "EXAVITQu4vr4xnSDxMaL",
  "Thomas": "GBv7mTt0atIp3Br8iCZE"
};

// Convert dictionary to array for easier rendering
const VOICES = Object.entries(VOICE_CODE_DICT).map(([name, id]) => ({
  name,
  id
}));

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
  const context = useContext(UserContext);
  const user = context?.user;
  const userLoading = context?.isLoading;

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
  const [voiceId, setVoiceId] = useState('');
  const [voiceName, setVoiceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
            // Sort videos by created_at date in descending order (newest first)
            const sortedData = data.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setVideos(sortedData);
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

  const playAudioSample = (name: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    if (playingVoice === name) {
      setPlayingVoice(null);
    } else {
      const audio = new Audio(`/voices/${name.toLowerCase()}_sample.mp3`);
      audio.onended = () => setPlayingVoice(null);
      audio.play();
      audioRef.current = audio;
      setPlayingVoice(name);
    }
  };

  const handleVoiceSelect = (value: string) => {
    // Find the voice by ID
    const selectedVoice = VOICES.find(voice => voice.id === value);
    if (selectedVoice) {
      setVoiceId(value);
      setVoiceName(selectedVoice.name);
    }
  };
  
  // Separate handler for clicking on voice items
  const handleVoiceItemClick = (voiceId: string) => {
    handleVoiceSelect(voiceId);
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const videoData: VideoRequest = {
      topic,
      voice: voiceId,
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
        setVoiceId('');
        setVoiceName('');
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

  // Get voice name from ID for display in cards
  const getVoiceNameFromId = (id: string) => {
    const voice = VOICES.find(v => v.id === id);
    return voice ? voice.name : id;
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
                <label className="text-sm font-medium">Voice</label>
                <div className="mt-1">
                  <Select onValueChange={handleVoiceSelect} value={voiceId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICES.map(voice => (
                        <div key={voice.id} className="flex items-center px-2 py-1.5 justify-between">
                          <SelectItem 
                            value={voice.id} 
                            className="p-0 flex-1"
                          >
                            {voice.name}
                          </SelectItem>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 shrink-0 ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              playAudioSample(voice.name);
                            }}
                          >
                            {playingVoice === voice.name ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  <p className="text-sm text-gray-500">
                    Voice: {getVoiceNameFromId(video.voice)}
                  </p>
                  <p className="text-sm text-gray-500">Topic: {video.topic}</p>
                  {video.audio_url && (
                    <p className="text-sm text-gray-500">audio: {video.audio_url}</p>
                  )}
                </div>
                {video.video_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer">
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
  );
}