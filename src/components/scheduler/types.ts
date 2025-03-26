export interface TaskTranslation {
  title: string;
  description: string;
  language_code: string;
}

export interface MediaUrl {
  file: string | null;
  file_url: string | null;
}

export interface Task {
  id: string;
  content: string;
  day: string;
  time: string;
  duration: number;
  mediaType?: 'png' | 'jpeg' | 'mp4' | 'jpg' | 'webp';
  mediaUrl?: MediaUrl;
  thumbnail?: string | null;
  translations?: TaskTranslation[];
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface WeeklyData {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
}