
import { CoverData } from "@/components/cover/CoverTypes";

/**
 * Gets cached cover data for a profile
 */
export function getCachedCoverData(profileId: string): CoverData | null {
  const cachedData = localStorage.getItem(`cover_data_${profileId}`);
  return cachedData ? JSON.parse(cachedData) : null;
}

/**
 * Caches cover data for a profile
 */
export function cacheCoverData(profileId: string, coverData: CoverData): void {
  localStorage.setItem(`cover_data_${profileId}`, JSON.stringify(coverData));
  localStorage.setItem(`cover_data_last_fetched_${profileId}`, new Date().toISOString());
}

/**
 * Updates the timestamp when cover data was last saved
 */
export function markCoverDataSaved(profileId: string, updatedAt?: string): void {
  localStorage.setItem(`cover_data_saved_at_${profileId}`, new Date().toISOString());
  if (updatedAt) {
    localStorage.setItem(`cover_data_updated_at_${profileId}`, updatedAt);
  }
}

/**
 * Marks that saving of cover data is in progress
 */
export function markCoverDataSaving(profileId: string): void {
  localStorage.setItem(`cover_data_saving_${profileId}`, new Date().toISOString());
}
