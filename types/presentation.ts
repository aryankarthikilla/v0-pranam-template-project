export interface Subject {
  id: string;
  name: string;
  subject_type?: string;
  course_name?: string;
  tags: string[];
  description?: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Slide {
  id: string;
  subject_id: string;
  title: string;
  subtitle?: string;
  content?: string;
  code_block?: string;
  code_language?: string;
  image_url?: string;
  slide_order: number;
  slide_type: "content" | "title" | "section" | "code" | "image" | "quiz";
  background_color: string;
  text_color: string;
  template: string;
  notes?: string;
  duration_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface PresentationSession {
  id: string;
  subject_id: string;
  session_name: string;
  start_time?: string;
  end_time?: string;
  audience_size?: number;
  venue?: string;
  session_type?: string;
  feedback_score?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface SlideAnalytics {
  id: string;
  slide_id: string;
  session_id?: string;
  time_spent_seconds?: number;
  skip_count: number;
  engagement_score?: number;
  questions_asked: number;
  created_at: string;
}

export interface TrainingResource {
  id: string;
  subject_id: string;
  title: string;
  resource_type: "pdf" | "video" | "link" | "document" | "exercise";
  url?: string;
  file_path?: string;
  description?: string;
  is_public: boolean;
  download_count: number;
  created_at: string;
  created_by?: string;
}

export interface PresentationMode {
  isFullscreen: boolean;
  isSlideshow: boolean;
  currentSlideIndex: number;
  showNotes: boolean;
  showTimer: boolean;
  autoAdvance: boolean;
  autoAdvanceDelay: number;
}
