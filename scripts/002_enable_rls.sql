-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Novels table policies
CREATE POLICY "Anyone can view novels" ON public.novels FOR SELECT USING (true);
CREATE POLICY "Authors can create novels" ON public.novels FOR INSERT WITH CHECK (
  auth.uid() = author_id AND 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('author', 'admin'))
);
CREATE POLICY "Authors can update own novels" ON public.novels FOR UPDATE USING (
  auth.uid() = author_id AND 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('author', 'admin'))
);
CREATE POLICY "Authors can delete own novels" ON public.novels FOR DELETE USING (
  auth.uid() = author_id AND 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('author', 'admin'))
);

-- Chapters table policies
CREATE POLICY "Anyone can view chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Authors can create chapters for own novels" ON public.chapters FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.novels WHERE id = novel_id AND author_id = auth.uid())
);
CREATE POLICY "Authors can update chapters for own novels" ON public.chapters FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.novels WHERE id = novel_id AND author_id = auth.uid())
);
CREATE POLICY "Authors can delete chapters for own novels" ON public.chapters FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.novels WHERE id = novel_id AND author_id = auth.uid())
);

-- Bookmarks table policies
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Reviews table policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Reading history table policies
CREATE POLICY "Users can view own reading history" ON public.reading_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reading history" ON public.reading_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading history" ON public.reading_history FOR UPDATE USING (auth.uid() = user_id);

-- Comments table policies
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);
