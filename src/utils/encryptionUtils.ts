
import { supabase } from "@/integrations/supabase/client";

/**
 * Encrypts sensitive text data before storing in the database
 * 
 * @param text The text to encrypt
 * @returns Promise with the encrypted text
 */
export const encryptText = async (text: string | null): Promise<string | null> => {
  if (!text) return null;
  
  try {
    const { data, error } = await supabase.rpc('encrypt_text', {
      text_to_encrypt: text
    });

    if (error) {
      console.error("Encryption error:", error);
      throw new Error("Failed to encrypt data");
    }

    return data as string;
  } catch (error) {
    console.error("Encryption utility error:", error);
    // Return original text if encryption fails to prevent data loss
    // In production, you might want to handle this differently
    return text;
  }
};

/**
 * Decrypts data retrieved from the database
 * 
 * @param encryptedText The encrypted text to decrypt
 * @returns Promise with the decrypted text
 */
export const decryptText = async (encryptedText: string | null): Promise<string | null> => {
  if (!encryptedText) return null;

  try {
    const { data, error } = await supabase.rpc('decrypt_text', {
      encrypted_text: encryptedText
    });

    if (error) {
      console.error("Decryption error:", error);
      return "[Encrypted content]";
    }

    return data as string;
  } catch (error) {
    console.error("Decryption utility error:", error);
    return "[Encrypted content]";
  }
};

/**
 * Helper function to encrypt story content
 * 
 * @param content The story content to encrypt
 * @returns Promise with the encrypted content
 */
export const encryptStoryContent = async (content: string): Promise<string> => {
  const encrypted = await encryptText(content);
  return encrypted || content;
};

/**
 * Helper function to decrypt story content
 * 
 * @param encryptedContent The encrypted story content
 * @returns Promise with the decrypted content
 */
export const decryptStoryContent = async (encryptedContent: string): Promise<string> => {
  const decrypted = await decryptText(encryptedContent);
  return decrypted || "[Encrypted story content]";
};

/**
 * Encrypts a complete story object's sensitive fields
 * 
 * @param story The story object to encrypt
 * @returns Promise with the encrypted story object
 */
export const encryptStory = async (story: any): Promise<any> => {
  if (!story) return story;

  const encryptedStory = { ...story };
  
  if (story.content) {
    encryptedStory.content = await encryptStoryContent(story.content);
  }
  
  if (story.title) {
    encryptedStory.title = await encryptText(story.title);
  }
  
  if (story.summary) {
    encryptedStory.summary = await encryptText(story.summary);
  }
  
  return encryptedStory;
};

/**
 * Decrypts a complete story object's sensitive fields
 * 
 * @param encryptedStory The encrypted story object
 * @returns Promise with the decrypted story object
 */
export const decryptStory = async (encryptedStory: any): Promise<any> => {
  if (!encryptedStory) return encryptedStory;

  const decryptedStory = { ...encryptedStory };
  
  if (encryptedStory.content) {
    decryptedStory.content = await decryptStoryContent(encryptedStory.content);
  }
  
  if (encryptedStory.title) {
    decryptedStory.title = await decryptText(encryptedStory.title);
  }
  
  if (encryptedStory.summary) {
    decryptedStory.summary = await decryptText(encryptedStory.summary);
  }
  
  return decryptedStory;
};

/**
 * Batch decrypts an array of stories
 * 
 * @param encryptedStories Array of encrypted story objects
 * @returns Promise with array of decrypted story objects
 */
export const decryptStories = async (encryptedStories: any[]): Promise<any[]> => {
  if (!encryptedStories || !Array.isArray(encryptedStories)) return [];
  
  return Promise.all(encryptedStories.map(story => decryptStory(story)));
};
