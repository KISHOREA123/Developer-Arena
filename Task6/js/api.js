const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

const WEATHER_CODE_MAP = {
  0: { label: 'Clear sky', icon: 'sun' },
  1: { label: 'Mainly clear', icon: 'partly' },
  2: { label: 'Partly cloudy', icon: 'partly' },
  3: { label: 'Overcast', icon: 'cloud' },
  45: { label: 'Fog', icon: 'fog' },
  48: { label: 'Rime fog', icon: 'fog' },
  51: { label: 'Light drizzle', icon: 'rain' },
  53: { label: 'Drizzle', icon: 'rain' },
  55: { label: 'Dense drizzle', icon: 'rain' },
  61: { label: 'Light rain', icon: 'rain' },
  63: { label: 'Rain', icon: 'rain' },
  65: { label: 'Heavy rain', icon: 'rain' },
  66: { label: 'Freezing rain', icon: 'rain' },
  67: { label: 'Freezing rain', icon: 'rain' },
  71: { label: 'Light snow', icon: 'snow' },
  73: { label: 'Snow', icon: 'snow' },
  75: { label: 'Heavy snow', icon: 'snow' },
  77: { label: 'Snow grains', icon: 'snow' },
  80: { label: 'Rain showers', icon: 'rain' },
  81: { label: 'Rain showers', icon: 'rain' },
  82: { label: 'Violent rain showers', icon: 'rain' },
  85: { label: 'Snow showers', icon: 'snow' },
  86: { label: 'Heavy snow showers', icon: 'snow' },
  95: { label: 'Thunderstorm', icon: 'storm' },
  96: { label: 'Thunderstorm with hail', icon: 'storm' },
  99: { label: 'Thunderstorm with hail', icon: 'storm' }
};

export async function fetchWeatherForCity(city, units = 'metric') {
  const location = await geocodeCity(city);
  if (!location) {
    throw new Error('No matching city was found. Try a different spelling.');
  }

  return fetchWeatherForCoordinates(location.latitude, location.longitude, location.name, location.country, units);
}

export async function fetchWeatherForCoordinates(latitude, longitude, name, country, units = 'metric') {
  const url = new URL(FORECAST_ENDPOINT);
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('current_weather', 'true');
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max');
  url.searchParams.set('hourly', 'relativehumidity_2m,visibility');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('temperature_unit', units === 'imperial' ? 'fahrenheit' : 'celsius');
  url.searchParams.set('wind_speed_unit', units === 'imperial' ? 'mph' : 'kmh');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Weather service is unavailable right now. Please try again.');
  }

  const data = await response.json();
  return formatWeatherPayload(data, { name, country, units });
}

export async function fetchWeatherForBrowserLocation(position, units = 'metric') {
  return fetchWeatherForCoordinates(position.coords.latitude, position.coords.longitude, 'Your location', '', units);
}

export function getWeatherDetails(code) {
  return WEATHER_CODE_MAP[code] || { label: 'Weather data unavailable', icon: 'cloud' };
}

function geocodeCity(city) {
  const url = new URL(GEOCODING_ENDPOINT);
  url.searchParams.set('name', city);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unable to look up that city right now.');
      }
      return response.json();
    })
    .then((data) => {
      const result = Array.isArray(data.results) ? data.results[0] : null;
      if (!result) {
        return null;
      }

      return {
        name: result.name,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude
      };
    });
}

function formatWeatherPayload(data, location, units) {
  const currentCode = data.current_weather?.weathercode ?? 0;
  const currentDetails = getWeatherDetails(currentCode);
  const todayHumidity = data.hourly?.relativehumidity_2m?.[0] ?? null;
  const visibility = data.hourly?.visibility?.[0] ?? null;
  const dailyDates = data.daily?.time ?? [];
  const dailyCodes = data.daily?.weathercode ?? [];
  const highs = data.daily?.temperature_2m_max ?? [];
  const lows = data.daily?.temperature_2m_min ?? [];
  const rainChance = data.daily?.precipitation_probability_max ?? [];

  const forecast = dailyDates.slice(0, 5).map((date, index) => ({
    date,
    label: formatDayLabel(date, index === 0),
    code: dailyCodes[index],
    description: getWeatherDetails(dailyCodes[index]).label,
    high: highs[index],
    low: lows[index],
    rainChance: rainChance[index]
  }));

  return {
    location: [location.name, location.country].filter(Boolean).join(', '),
    units,
    current: {
      temperature: data.current_weather?.temperature,
      windSpeed: data.current_weather?.windspeed,
      weatherCode: currentCode,
      description: currentDetails.label,
      humidity: todayHumidity,
      visibility,
      feelsLike: data.current_weather?.temperature
    },
    forecast
  };
}

function formatDayLabel(dateString, isToday) {
  if (isToday) {
    return 'Today';
  }

  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date);
}

export function formatTemperature(value, units) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--';
  }

  return `${Math.round(Number(value))}°${units === 'imperial' ? 'F' : 'C'}`;
}

export function formatWindSpeed(value, units) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--';
  }

  return `${Math.round(Number(value))} ${units === 'imperial' ? 'mph' : 'km/h'}`;
}

export function formatVisibility(value, units) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--';
  }

  const kilometers = Number(value) / 1000;
  if (units === 'imperial') {
    return `${(kilometers * 0.621).toFixed(1)} mi`;
  }

  return `${kilometers.toFixed(1)} km`;
}

export function createWeatherIcon(type) {
  const paths = {
    sun: '<path d="M30 8v6M30 46v6M8 30h6M46 30h6M14.4 14.4l4.2 4.2M41.4 41.4l4.2 4.2M14.4 45.6l4.2-4.2M41.4 18.6l4.2-4.2"/><circle cx="30" cy="30" r="12" fill="currentColor"/>',
    partly: '<path d="M20 35c0-7.2 5.8-13 13-13 5.2 0 9.6 3 11.7 7.3A10 10 0 0 1 46 29a9 9 0 0 1-1.2 4.5"/><circle cx="21" cy="23" r="8" fill="currentColor" opacity="0.9"/><path d="M15 40h27" stroke="currentColor" stroke-linecap="round" stroke-width="3"/>',
    cloud: '<path d="M17 42h21c5.5 0 10-4.2 10-9.4 0-4.8-3.8-8.8-8.7-9.3C38.5 18 34.7 15 30 15c-5.7 0-10.5 4.3-11.1 9.8C14.8 25 12 28.1 12 31.8 12 36.2 14.8 42 17 42Z"/>',
    rain: '<path d="M16 28c0-6.1 4.9-11 11-11 4.5 0 8.4 2.7 10.1 6.5A8.9 8.9 0 0 1 40 23a8 8 0 0 1-1.1 4"/><path d="M22 42l-2 5M32 42l-2 5M42 42l-2 5" stroke="currentColor" stroke-linecap="round" stroke-width="3"/><path d="M18 33h21" stroke="currentColor" stroke-linecap="round" stroke-width="3"/>',
    snow: '<path d="M16 28c0-6.1 4.9-11 11-11 4.5 0 8.4 2.7 10.1 6.5A8.9 8.9 0 0 1 40 23a8 8 0 0 1-1.1 4"/><path d="M22 41l0 6M19 44l6 0M18.5 42.5l4.2 4.2M22.7 42.5l-4.2 4.2M32 41l0 6M29 44l6 0M28.5 42.5l4.2 4.2M32.7 42.5l-4.2 4.2" stroke="currentColor" stroke-linecap="round" stroke-width="2.2"/>',
    fog: '<path d="M12 26h36M14 34h32M11 42h34" stroke="currentColor" stroke-linecap="round" stroke-width="3" opacity="0.7"/>' ,
    storm: '<path d="M16 28c0-6.1 4.9-11 11-11 4.5 0 8.4 2.7 10.1 6.5A8.9 8.9 0 0 1 40 23a8 8 0 0 1-1.1 4"/><path d="M29 30l-4 8h5l-2 8 7-10h-5l2-6z" fill="currentColor"/>'
  };

  return `
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${paths[type] || paths.cloud}
    </svg>
  `;
}
