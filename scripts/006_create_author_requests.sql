-- Create author_requests table
CREATE TABLE IF NOT EXISTS author_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_author_requests_user_id ON author_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_author_requests_status ON author_requests(status);

-- Enable RLS
ALTER TABLE author_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON author_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own requests (only if they don't have a pending request)
CREATE POLICY "Users can create requests"
  ON author_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM author_requests 
      WHERE user_id = auth.uid() 
      AND status = 'pending'
    )
  );

-- Fixed table reference from user_profiles to users
-- Policy: Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON author_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can update requests
CREATE POLICY "Admins can update requests"
  ON author_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_author_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER author_requests_updated_at
  BEFORE UPDATE ON author_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_author_request_updated_at();
