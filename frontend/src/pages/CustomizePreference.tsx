// A preferences form where users select their dietary restrictions, 
// alcohol types, and flavor preferences, then save them.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadPreferences, savePreferences } from "../utils/preferences";

// Static lists of options rendered as checkboxes in each section.
const DIETARY = [
  "Celiac / Gluten-Free", "Vegan", "Vegetarian",
  "Pescatarian", "Dairy-Free", "Nut Allergy",
  "Shellfish Allergy", "Kosher",
];

const ALCOHOL_NOTES = [
  "Light & Bubbling",
  "Fresh & Zesty",
  "Rich & Warming",
  "Sweet & Bold",
  "Earthy & Traditional",
];

const FLAVORS = [
  "Sweet", "Dry", "Sour / Tart", "Bitter", "Savory / Umami",
  "Fruity", "Earthy", "Spicy / Bold", "Crisp / Refreshing", "Smooth / Mellow",
];

// If the item is already in the list, removes it. 
// If not, adds it. Used to handle checkbox clicks.
function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

// Three arrays track what the user has checked. 
// On mount, loadPreferences() pulls any previously saved selections so the checkboxes are pre-filled.
export default function CustomizePreferences() {
  const navigate = useNavigate();
  const [dietary, setDietary] = useState<string[]>([]);
  const [alcoholNotes, setAlcoholNotes] = useState<string[]>([]);
  const [flavors, setFlavors] = useState<string[]>([]);

  useEffect(() => {
    const saved = loadPreferences();
    setDietary(saved.dietary);
    setAlcoholNotes(saved.alcoholNotes);
    setFlavors(saved.flavors);
  }, []);

  // Saves the current selections then redirects to the dashboard.
  function handleSave() {
    savePreferences({ dietary, alcoholNotes, flavors });
    navigate("/dashboard");
  }

  return (
    <div className="customize-page">
      <div className="customize-header">
        <h1 className="customize-title">Customize Your Pairing</h1>
        <p className="customize-sub">
          Tell us about your preferences and restrictions so we can recommend the perfect
          pairings just for you.
        </p>
      </div>

      {/*Maps over each list to render checkboxes. 
      checked is driven by whether the item is in state, and onChange calls toggle to add/remove it.*/}
      <div className="pref-section">
        <h2 className="pref-section-title">Dietary Restrictions</h2>
        <p className="pref-section-sub">Select any dietary restrictions or allergies (optional)</p>
        <div className="checkbox-grid">
          {DIETARY.map((item) => (
            <label key={item} className="checkbox-label">
              <input
                type="checkbox"
                checked={dietary.includes(item)}
                onChange={() => setDietary(toggle(dietary, item))}
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="pref-section">
        <h2 className="pref-section-title">Alcohol Notes</h2>
        <p className="pref-section-sub">Choose the drinking mood that suits you</p>
        <div className="checkbox-grid">
          {ALCOHOL_NOTES.map((item) => (
            <label key={item} className="checkbox-label">
              <input
                type="checkbox"
                checked={alcoholNotes.includes(item)}
                onChange={() => setAlcoholNotes(toggle(alcoholNotes, item))}
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="pref-section">
        <h2 className="pref-section-title">Flavor Preferences</h2>
        <p className="pref-section-sub">What flavor profiles do you enjoy?</p>
        <div className="checkbox-grid checkbox-grid--5">
          {FLAVORS.map((item) => (
            <label key={item} className="checkbox-label">
              <input
                type="checkbox"
                checked={flavors.includes(item)}
                onChange={() => setFlavors(toggle(flavors, item))}
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="customize-footer">
        <button className="button primary customize-save" onClick={handleSave}>
          Save Preferences
        </button>
      </div>
    </div>
  );
}
