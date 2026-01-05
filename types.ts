
export interface Attachment {
  data: string; // base64
  mimeType: string;
  name: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  thinking?: string;
  groundingUrls?: Array<{ uri: string; title: string }>;
  attachments?: Attachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export type AIMode = 'general' | 'study' | 'math' | 'research';

export interface AppState {
  currentSessionId: string | null;
  sessions: ChatSession[];
  isLoading: boolean;
  isDeepThinking: boolean;
  isWebSearch: boolean;
  activeMode: AIMode;
}
