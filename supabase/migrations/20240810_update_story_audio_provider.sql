
-- Add provider column to story_audio table if it doesn't exist
ALTER TABLE story_audio
ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'elevenlabs';

-- Create index on provider column
CREATE INDEX IF NOT EXISTS idx_story_audio_provider ON story_audio (provider);
