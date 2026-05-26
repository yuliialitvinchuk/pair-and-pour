// Defines the shape of the preferences object used across the whole app. Three fields, each an array of strings.
export type Preferences = {
  dietary: string[];
  alcoholNotes: string[];
  flavors: string[];
};

// The string key used to store/read from localStorage. Centralising it here means if we ever rename it, we only change it in one place.
const KEY = "sipsync_preferences";

// Reads saved preferences from the browser's localStorage.
export function loadPreferences(): Preferences {
  try {
    // Tries to get the stored value by key — returns null if nothing is saved yet.
    const raw = localStorage.getItem(KEY);
    // If something was found, parses the JSON string back into a JavaScript object and returns it.
    if (raw) return JSON.parse(raw);
    // Silently swallows any error (e.g. if the stored data is corrupted/invalid JSON).
  } catch {}
  // The fallback — returns empty arrays for all three fields, so the rest of the app always gets a valid object even on first use.
  return { dietary: [], alcoholNotes: [], flavors: [] };
}

// Converts the object to a string (localStorage can only store strings)
// Saves it under the same key so loadPreferences can find it later
export function savePreferences(prefs: Preferences): void {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}

// A simple helper that returns true if the user has saved at least one preference in any category. 
// Used in PairFood.tsx and PairDrink.tsx to decide whether to show "none saved" hint or the actual saved preferences in the collapsible panel.
export function hasAnyPreferences(prefs: Preferences): boolean {
  return prefs.dietary.length > 0 || prefs.alcoholNotes.length > 0 || prefs.flavors.length > 0;
}