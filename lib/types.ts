export interface User {
  id: string
  email: string
  display_name: string
  role: "reader" | "author" | "admin"
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Novel {
  id: string
  title: string
  description: string
  cover_image_url?: string
  author_id: string
  status: "ongoing" | "completed" | "hiatus"
  total_chapters: number
  total_views: number
  created_at: string
  updated_at: string
  author?: User
  average_rating?: number
  user_bookmark?: boolean
  user_review?: Review
}

export interface Chapter {
  id: string
  novel_id: string
  chapter_number: number
  title: string
  content: string
  views: number
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  novel_id: string
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  novel_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
  user?: User
}

export interface ReadingHistory {
  id: string
  user_id: string
  chapter_id: string
  novel_id: string
  last_read_at: string
  chapter?: Chapter
  novel?: Novel
}

export interface Comment {
  id: string
  user_id: string
  chapter_id: string
  content: string
  created_at: string
  updated_at: string
  user?: User
}

export interface AuthorRequest {
  id: string
  user_id: string
  reason: string
  status: "pending" | "approved" | "rejected"
  admin_note?: string
  created_at: string
  updated_at: string
  user?: User
}
