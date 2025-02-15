// types/video.ts

export enum VideoStatus {
  PENDING = "pending",
  GENERATING_SCRIPT = "generating_script",
  GENERATING_VOICE = "generating_voice",
  GENERATING_PROMPTS = "generating_prompts",
  GENERATING_IMAGES = "generating_images",
  COMPILING = "compiling",
  COMPLETED = "completed",
  FAILED = "failed"
}

interface ImagePrompt {
  index: number;
  prompt: string;
}

interface GeneratedImage {
  index: number;
  url: string;
}


interface VideoBase {
  id: string;
  user_id: string;
  topic: string;
  voice: string;
  title: string;
  creation_status: VideoStatus;
  created_at: string;
}

export interface VideoCreate extends VideoBase {
  script: string;
}

export interface VideoList extends VideoBase {
  final_url?: string;
}

export interface VideoDetail extends VideoBase {
  script: string;
  img_prompts?: ImagePrompt[];
  audio_url?: string;
  images?: GeneratedImage[];
  final_url?: string;
}

export interface CreateVideoRequest {
  topic: string;
  voice: string;
}

export interface CreateVideoResponse extends VideoCreate {
  id: string;
}