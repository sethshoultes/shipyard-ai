export interface Prompt {
  id: string;
  title: string;
  body: string;
  tags?: string[];
  createdAt?: string;
}

export interface Portfolio {
  slug: string;
  title: string;
  author?: string;
  bio?: string;
  prompts: Prompt[];
  createdAt: string;
  updatedAt: string;
}

export interface ClaudeMessage {
  uuid: string;
  text: string;
  sender: string;
  created_at: string;
  updated_at: string;
}

export interface ClaudeConversation {
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
  messages?: ClaudeMessage[];
}

export interface ClaudeExport {
  conversations?: ClaudeConversation[];
}

export interface OGImageProps {
  title: string;
  prompt: string;
  author?: string;
}

export interface ExportPayload {
  slug: string;
}
