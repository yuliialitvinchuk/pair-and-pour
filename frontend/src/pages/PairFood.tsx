import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { loadPreferences, hasAnyPreferences } from "../utils/preferences";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (res.status === 401) {
    const body = await res.clone().json().catch(() => ({}));
    if (body?.error?.code === "TOKEN_EXPIRED") {
      try {
        const freshToken = await user.getIdToken(true);
        return await fetch(`${API_URL}${path}`, {
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${freshToken}`, "Content-Type": "application/json" },
        });
      } catch {
        throw new Error("Session refresh failed. Please sign in again.");
      }
    }
  }
  return res;
}

type SuggestionItem = { id: string; name: string; category?: string };

export default function PairFood() {
  const navigate = useNavigate();
  const [dish, setDish] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefs = loadPreferences();
  const hasPrefs = hasAnyPreferences(prefs);

  // Fetch suggestions as user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (dish.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiFetch(`/foods?search=${encodeURIComponent(dish.trim())}&limit=8`);
        if (!res.ok) return;
        const data = await res.json();
        const items: SuggestionItem[] = data.data?.items || [];
        setSuggestions(items);
        setShowDropdown(items.length > 0);
        setActiveSuggestion(-1);
      } catch {
        setSuggestions([]);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [dish]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectSuggestion(item: SuggestionItem) {
    setDish(item.name);
    setSelectedFoodId(item.id);
    setSuggestions([]);
    setShowDropdown(false);
    setActiveSuggestion(-1);
    setNotFound(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeSuggestion]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDish(e.target.value);
    setSelectedFoodId(null); // clear selection if user edits again
    setNotFound(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dish.trim()) return;
    setLoading(true);
    setNotFound(false);

    try {
      let foodId = selectedFoodId;

      // If nothing was selected from dropdown, do a search to find the best match
      if (!foodId) {
        const foodsRes = await apiFetch(`/foods?search=${encodeURIComponent(dish.trim())}&limit=1`);
        if (!foodsRes.ok) { setNotFound(true); return; }
        const foodsData = await foodsRes.json();
        if (!foodsData.data?.items?.length) { setNotFound(true); return; }
        foodId = foodsData.data.items[0].id;
      }

      const pairRes = await apiFetch("/pair", {
        method: "POST",
        body: JSON.stringify({
          foodId,
          dietary: prefs.dietary,
          alcoholNotes: prefs.alcoholNotes,
          flavors: prefs.flavors,
        }),
      });
      const pairData = await pairRes.json();
      if (!pairRes.ok || !pairData.data?.pairings?.length) { setNotFound(true); return; }

      setResult(
        pairData.data.pairings.map((p: { drink: { name?: string; id: string }; reason?: string }) => {
          const name = p.drink?.name || p.drink?.id;
          return p.reason ? `${name} — ${p.reason}` : name;
        })
      );
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="pair-page">
        <div className="pair-card">
          <h1 className="pair-title">Pairings for: {dish}</h1>
          <ul className="result-list">
            {result.map((r) => (
              <li key={r} className="result-item">{r}</li>
            ))}
          </ul>
          <button
            className="button primary"
            style={{ marginTop: 24 }}
            onClick={() => { setResult(null); setDish(""); setSelectedFoodId(null); }}
          >
            Try another dish
          </button>
          <button
            className="button primary"
            style={{ marginTop: 12 }}
            onClick={() => navigate("/pair/drink")}
          >
            Try drink pairings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pair-page">
      <div className="pair-card">
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        <h1 className="pair-title">Pair with Food</h1>
        <p className="pair-sub">Start typing a dish and pick from the suggestions.</p>

        <form onSubmit={handleSubmit}>
          <div className="pair-field" style={{ position: "relative" }}>
            <label className="pair-label">Dish Name</label>
            <input
              ref={inputRef}
              className="pair-input"
              type="text"
              value={dish}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="e.g., Tacos, Ramen, Steak…"
              autoComplete="off"
            />

            {showDropdown && suggestions.length > 0 && (
              <div ref={dropdownRef} className="food-dropdown">
                {suggestions.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`food-dropdown-item${i === activeSuggestion ? " food-dropdown-item--active" : ""}`}
                    onMouseDown={() => selectSuggestion(item)}
                  >
                    <span className="food-dropdown-name">{item.name}</span>
                    {item.category && (
                      <span className="food-dropdown-category">
                        {item.category.replace(/_/g, " ")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="prefs-banner"
            onClick={() => setPrefsOpen((v) => !v)}
          >
            <span className="prefs-banner-icon">✦</span>
            YOUR PREFERENCES
            {!hasPrefs && (
              <span className="prefs-banner-hint">
                {" "}— none saved &middot;{" "}
                <Link to="/customize" onClick={(e) => e.stopPropagation()}>
                  Set up
                </Link>
              </span>
            )}
            <span className="prefs-banner-chevron">{prefsOpen ? "▲" : "▼"}</span>
          </button>

          {prefsOpen && (
            <div className="prefs-summary">
              {hasPrefs ? (
                <>
                  {prefs.dietary.length > 0 && (
                    <div className="prefs-row">
                      <span className="prefs-row-label">Dietary</span>
                      {prefs.dietary.join(", ")}
                    </div>
                  )}
                  {prefs.alcoholNotes.length > 0 && (
                    <div className="prefs-row">
                      <span className="prefs-row-label">Alcohol Notes</span>
                      {prefs.alcoholNotes.join(", ")}
                    </div>
                  )}
                  {prefs.flavors.length > 0 && (
                    <div className="prefs-row">
                      <span className="prefs-row-label">Flavors</span>
                      {prefs.flavors.join(", ")}
                    </div>
                  )}
                  <Link to="/customize" className="prefs-edit-link">Edit preferences</Link>
                </>
              ) : (
                <p className="prefs-empty">
                  No preferences saved yet.{" "}
                  <Link to="/customize">Set up your preferences</Link> to get more personalised results.
                </p>
              )}
            </div>
          )}

          {notFound && (
            <p className="pair-sub" style={{ color: "red", marginTop: 8 }}>
              No pairing found for "{dish}". Try a different dish name.
            </p>
          )}

          <button
            className="button primary"
            type="submit"
            disabled={!dish.trim() || loading}
            style={{ marginTop: 16 }}
          >
            {loading ? "Looking up…" : "Get Personalised Pairing"}
          </button>
        </form>
      </div>
    </div>
  );
}
