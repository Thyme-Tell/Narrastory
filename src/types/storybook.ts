export interface Storybook {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StorybookStory {
  story_id: string;
  storybook_id: string;
  added_at: string;
}