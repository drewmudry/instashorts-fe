// types/video.ts

export enum VideoStatus {
  PENDING = "Pending",
  GENERATING_SCRIPT = "Writing Script",
  SCRIPT_COMPLETE = "Script Completed",
  
  GENERATING_VOICE = "Generating Audio",
  VOICE_COMPLETE = "Narration Completed",
  
  GENERATING_PROMPTS = "Brainstorming Images",
  PROMPTS_COMPLETE = "Finalizing Content",
  
  GENERATING_IMAGES = "Crafting Images",
  IMAGES_COMPLETE = "Images Finished",
  
  COMPILING = "Video Rendering",
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

export interface VideoRequest {
  topic: string;
  voice: string;
}

export interface CreateVideoResponse extends VideoCreate {
  id: string;
}