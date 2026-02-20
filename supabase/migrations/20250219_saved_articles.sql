-- Create saved_articles table for saving articles for later
CREATE TABLE IF NOT EXISTS saved_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  feed_id UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  snippet TEXT,
  url TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMPTZ,
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hidden_articles table for hiding articles from feed
CREATE TABLE IF NOT EXISTS hidden_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  hidden_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_hidden_articles_user_id ON hidden_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_articles_article_id ON hidden_articles(article_id);

-- Add unique constraints to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_articles_unique ON saved_articles(user_id, article_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_hidden_articles_unique ON hidden_articles(user_id, article_id);

-- Enable RLS
ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_articles ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_articles
CREATE POLICY "Users can view their own saved articles" ON saved_articles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved articles" ON saved_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved articles" ON saved_articles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for hidden_articles
CREATE POLICY "Users can view their own hidden articles" ON hidden_articles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hidden articles" ON hidden_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hidden articles" ON hidden_articles
  FOR DELETE USING (auth.uid() = user_id);
