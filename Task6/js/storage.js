const STORAGE_KEY = 'weather-pulse-preferences';

const DEFAULT_PREFERENCES = {
  city: 'London',
  units: 'metric',
  favorites: ['London', 'New York', 'Tokyo']
};

export function loadPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_PREFERENCES };
    }

    const parsed = JSON.parse(stored);
    return {
      city: typeof parsed.city === 'string' && parsed.city.trim() ? parsed.city.trim() : DEFAULT_PREFERENCES.city,
      units: parsed.units === 'imperial' ? 'imperial' : 'metric',
      favorites: Array.isArray(parsed.favorites)
        ? parsed.favorites.filter((item) => typeof item === 'string' && item.trim()).slice(0, 6)
        : [...DEFAULT_PREFERENCES.favorites]
    };
  } catch (error) {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(preferences) {
  const payload = {
    city: preferences.city,
    units: preferences.units,
    favorites: preferences.favorites
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function addFavoriteCity(city, favorites = []) {
  const normalized = city.trim();
  if (!normalized) {
    return [...favorites];
  }

  const nextFavorites = [normalized, ...favorites.filter((entry) => entry.toLowerCase() !== normalized.toLowerCase())];
  return nextFavorites.slice(0, 6);
}

export function removeFavoriteCity(city, favorites = []) {
  const normalized = city.trim().toLowerCase();
  return favorites.filter((entry) => entry.trim().toLowerCase() !== normalized);
}
