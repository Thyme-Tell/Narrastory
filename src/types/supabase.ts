import { Database } from "@/integrations/supabase/types";

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type StorybookRole = Enums<'storybook_role'>;

// Define specific table types
export type Profile = Tables<'profiles'>;
export type Story = Tables<'stories'>;
export type StoryMedia = Tables<'story_media'>;
export type Storybook = Tables<'storybooks'>;
export type StorybookMember = Tables<'storybook_members'>;
export type StorybookStory = Tables<'storybook_stories'>;
export type DeletedStory = Tables<'deleted_stories'>;
export type PasswordResetToken = Tables<'password_reset_tokens'>;

// Helper type for Supabase query responses
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;