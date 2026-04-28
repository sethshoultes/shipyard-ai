export interface Job {
  jobId: string;
  repo: string;
  since: string;
  until: string;
  status: 'pending' | 'fetching' | 'narrating' | 'rendering' | 'complete' | 'failed';
  createdAt: string;
  outputUrl: string | null;
  error: string | null;
  voice: string;
  script?: ScriptLine[];
  audioUrl?: string;
}

export interface ScriptLine {
  text: string;
  timestamp: number;
}

export interface QueueMessage {
  jobId: string;
  repo: string;
  since: string;
  until: string;
  voice: string;
  script: ScriptLine[];
  audioUrl: string;
}

export interface RenderResult {
  jobId: string;
  outputUrl: string;
}

export interface ChangelogRequest {
  repo: string;
  since: string;
  until: string;
  voice?: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}
