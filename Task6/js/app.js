import {
  createWeatherIcon,
  fetchWeatherForBrowserLocation,
  fetchWeatherForCity,
  formatTemperature,
  formatVisibility,
  formatWindSpeed,
  getWeatherDetails
} from './api.js';
import {
  addFavoriteCity,
  loadPreferences,
  removeFavoriteCity,
  savePreferences
} from './storage.js';

const state = {
  preferences: loadPreferences(),
  weather: null,
  lastSource: null,
  loading: false,
  error: ''
};

const elements = {
  searchForm: document.getElementById('searchForm'),
  cityInput: document.getElementById('cityInput'),
  unitToggle: document.getElementById('unitToggle'),
  locationButton: document.getElementById('locationButton'),
  favoriteButton: document.getElementById('favoriteButton'),
  favoritesList: document.getElementById('favoritesList'),
  forecastGrid: document.getElementById('forecastGrid'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  statusMessage: document.getElementById('statusMessage'),
  liveRegion: document.getElementById('liveRegion'),
  locationTitle: document.getElementById('locationTitle'),
  temperatureValue: document.getElementById('temperatureValue'),
  weatherSummary: document.getElementById('weatherSummary'),
  weatherMark: document.getElementById('weatherMark'),
  feelsLikeValue: document.getElementById('feelsLikeValue'),
  humidityValue: document.getElementById('humidityValue'),
  windValue: document.getElementById('windValue'),
  visibilityValue: document.getElementById('visibilityValue')
};

init();

function init() {
  bindEvents();
  syncUnitButton();
  renderFavorites();
  searchWeather(state.preferences.city, { quiet: true });
}

function bindEvents() {
  elements.searchForm.addEventListener('submit', handleSearchSubmit);
  elements.unitToggle.addEventListener('click', toggleUnits);
  elements.locationButton.addEventListener('click', handleLocationLookup);
  elements.favoriteButton.addEventListener('click', toggleFavoriteCity);
  elements.favoritesList.addEventListener('click', handleFavoriteClick);
}

async function handleSearchSubmit(event) {
  event.preventDefault();
  const city = elements.cityInput.value.trim();
  if (!city) {
    setStatus('Type a city name before searching.', 'error');
    return;
  }

  await searchWeather(city);
}

async function handleLocationLookup() {
  if (!navigator.geolocation) {
    setStatus('Geolocation is not supported in this browser.', 'error');
    return;
  }

  setLoading(true);
  setStatus('Finding your location...', 'info');

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const result = await fetchWeatherForBrowserLocation(position, state.preferences.units);
        state.lastSource = { type: 'geo', position, label: 'Your location' };
        applyWeatherResult(result, { title: 'Your location', persistCity: false });
        setStatus('Weather loaded from your current location.', 'success');
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    },
    (error) => {
      setLoading(false);
      setStatus(error.message || 'Location access was denied.', 'error');
    },
    { enableHighAccuracy: false, timeout: 10000 }
  );
}

async function searchWeather(city, options = {}) {
  const query = city.trim();
  if (!query) {
    return;
  }

  setLoading(true);
  if (!options.quiet) {
    setStatus(`Searching weather for ${query}...`, 'info');
  }

  try {
    const result = await fetchWeatherForCity(query, state.preferences.units);
    state.lastSource = { type: 'city', city: query, label: query };
    applyWeatherResult(result, { title: query, persistCity: true });
    state.preferences.city = query;
    updateFavoriteButton();
    savePreferences(state.preferences);
    if (!options.quiet) {
      setStatus(`Showing weather for ${query}.`, 'success');
    }
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
}

function applyWeatherResult(result, options = {}) {
  const title = options.title || result.location;
  const persistCity = options.persistCity !== false;

  state.weather = result;
  if (persistCity) {
    state.preferences.city = title;
    elements.cityInput.value = title;
  }

  elements.locationTitle.textContent = title;
  elements.temperatureValue.textContent = formatTemperature(result.current.temperature, state.preferences.units);
  elements.weatherSummary.textContent = result.current.description;
  elements.weatherMark.innerHTML = createWeatherIcon(getWeatherDetails(result.current.weatherCode).icon);
  elements.feelsLikeValue.textContent = formatTemperature(result.current.feelsLike, state.preferences.units);
  elements.humidityValue.textContent = result.current.humidity === null ? '--%' : `${Math.round(result.current.humidity)}%`;
  elements.windValue.textContent = formatWindSpeed(result.current.windSpeed, state.preferences.units);
  elements.visibilityValue.textContent = formatVisibility(result.current.visibility, state.preferences.units);

  renderForecast(result.forecast);
  updateFavoriteButton();
  renderFavorites();
  if (persistCity) {
    savePreferences(state.preferences);
  }
  announce(`Loaded weather for ${result.location}.`);
}

function renderForecast(forecast = []) {
  if (!forecast.length) {
    elements.forecastGrid.innerHTML = '<p class="status-message">No forecast data is available right now.</p>';
    return;
  }

  elements.forecastGrid.innerHTML = forecast
    .map((day) => {
      const icon = getWeatherDetails(day.code).icon;
      return `
        <article class="forecast-card">
          <div class="forecast-card__icon">${createWeatherIcon(icon)}</div>
          <div>
            <p class="forecast-card__day">${day.label}</p>
            <p class="forecast-card__meta">${day.description}</p>
          </div>
          <p class="forecast-card__range">${formatTemperature(day.high, state.preferences.units)} / ${formatTemperature(day.low, state.preferences.units)}</p>
        </article>
      `;
    })
    .join('');
}

function renderFavorites() {
  const favorites = state.preferences.favorites;
  if (!favorites.length) {
    elements.favoritesList.innerHTML = '<p class="status-message">No saved cities yet.</p>';
    return;
  }

  elements.favoritesList.innerHTML = favorites
    .map(
      (city) => `
        <button class="favorite-chip" type="button" data-city="${escapeHtml(city)}">${escapeHtml(city)}</button>
      `
    )
    .join('');
}

function toggleFavoriteCity() {
  if (!state.preferences.city) {
    return;
  }

  const isSaved = state.preferences.favorites.some((entry) => entry.toLowerCase() === state.preferences.city.toLowerCase());
  state.preferences.favorites = isSaved
    ? removeFavoriteCity(state.preferences.city, state.preferences.favorites)
    : addFavoriteCity(state.preferences.city, state.preferences.favorites);

  savePreferences(state.preferences);
  renderFavorites();
  updateFavoriteButton();
  setStatus(isSaved ? 'Removed from saved cities.' : 'Added to saved cities.', 'success');
}

function handleFavoriteClick(event) {
  const button = event.target.closest('[data-city]');
  if (!button) {
    return;
  }

  const city = button.dataset.city;
  elements.cityInput.value = city;
  searchWeather(city);
}

function toggleUnits() {
  state.preferences.units = state.preferences.units === 'metric' ? 'imperial' : 'metric';
  syncUnitButton();
  savePreferences(state.preferences);

  refreshCurrentWeather().catch(handleError);
}

function syncUnitButton() {
  const isImperial = state.preferences.units === 'imperial';
  elements.unitToggle.textContent = `Units: ${isImperial ? 'Imperial' : 'Metric'}`;
  elements.unitToggle.setAttribute('aria-pressed', isImperial ? 'true' : 'false');
}

function updateFavoriteButton() {
  const isGeoSource = state.lastSource?.type === 'geo';
  elements.favoriteButton.disabled = isGeoSource;

  if (isGeoSource) {
    elements.favoriteButton.textContent = 'Save city';
    elements.favoriteButton.setAttribute('aria-pressed', 'false');
    return;
  }

  const isSaved = state.preferences.favorites.some((entry) => entry.toLowerCase() === state.preferences.city.toLowerCase());
  elements.favoriteButton.textContent = isSaved ? 'Saved city' : 'Save city';
  elements.favoriteButton.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
}

async function refreshCurrentWeather() {
  if (!state.lastSource) {
    return;
  }

  setLoading(true);

  try {
    const result =
      state.lastSource.type === 'geo'
        ? await fetchWeatherForBrowserLocation(state.lastSource.position, state.preferences.units)
        : await fetchWeatherForCity(state.lastSource.city, state.preferences.units);

    applyWeatherResult(result, {
      title: state.lastSource.label,
      persistCity: state.lastSource.type !== 'geo'
    });
    setStatus(`Units switched to ${state.preferences.units === 'metric' ? 'metric' : 'imperial'}.`, 'success');
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  state.loading = isLoading;
  elements.loadingOverlay.hidden = !isLoading;
}

function setStatus(message, kind = 'info') {
  state.error = kind === 'error' ? message : '';
  elements.statusMessage.textContent = message;
  elements.statusMessage.dataset.kind = kind;
}

function announce(message) {
  elements.liveRegion.textContent = message;
}

function handleError(error) {
  console.error(error);
  const message = error instanceof Error ? error.message : 'Something went wrong while loading the weather.';
  setStatus(message, 'error');
  announce(message);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
