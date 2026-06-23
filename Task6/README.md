# Task 6 — Weather Dashboard Application

## Project Overview

Weather Pulse is a responsive weather dashboard built for Week 6. It fetches live weather data with async JavaScript, shows a current-weather summary plus a 5-day forecast, and saves user preferences in Local Storage so the experience persists between visits.

### Goals

- Demonstrate asynchronous JavaScript with `async`/`await`.
- Integrate a real public API without requiring an API key.
- Handle API responses, transform JSON data, and render it into the UI.
- Persist user preferences such as city, units, and favorites.
- Provide an accessible, responsive interface with loading and error states.

## Setup Instructions

1. Open the `Arena` workspace in VS Code.
2. Open the `Task6` folder.
3. Run a local server from the workspace root:

```bash
python -m http.server 8000
```

4. Visit `http://localhost:8000/Task6/` in a browser.
5. Search for a city, switch units, and test the favorite city controls.

## Code Structure

- `index.html` — semantic page structure, search UI, weather cards, and live status regions.
- `css/styles.css` — all layout, responsive design, visual styling, and motion.
- `js/app.js` — application state, event handlers, rendering, loading states, and error handling.
- `js/api.js` — API requests, weather-code mapping, and data formatting helpers.
- `js/storage.js` — Local Storage read/write logic for preferences and saved cities.
- `screenshots/` — place submitted images here for visual proof of functionality.

## Visual Documentation

Add screenshots to the `screenshots/` folder to show the major features of the app. Recommended captures:

- Initial dashboard view.
- Search results for a city.
- 5-day forecast section.
- Imperial and metric unit toggle states.
- Loading and error feedback, if available.

Suggested filenames:

- `screenshots/home.png`
- `screenshots/search-result.png`
- `screenshots/forecast.png`
- `screenshots/units-toggle.png`

## Technical Details

### API Integration

The app uses Open-Meteo so it works without an API key.

- Geocoding endpoint: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast endpoint: `https://api.open-meteo.com/v1/forecast`

The flow is:

1. The user enters a city name.
2. The app looks up coordinates with the geocoding API.
3. The app requests current weather and forecast data for those coordinates.
4. The response is normalized into a smaller object that is easier to render.

### Async JavaScript Usage

The app uses `async`/`await` to keep request handling readable and predictable.

- `searchWeather()` waits for city lookup and forecast data.
- `handleLocationLookup()` uses the browser geolocation API and then fetches weather for the user’s coordinates.
- Loading UI is shown while requests are in progress and hidden afterward.
- Errors are caught with `try`/`catch` and shown in the status area.

### Data Handling

JSON returned from the weather API is transformed before rendering.

- Current temperature, wind speed, humidity, visibility, and weather codes are extracted from the response.
- Weather codes are mapped to human-readable labels and icons.
- Daily forecast arrays are converted into 5 forecast cards.
- Utility formatters convert raw values into user-friendly text such as `32°C`, `89°F`, or `10 km/h`.

### Local Storage Implementation

Preferences are saved in Local Storage under one key: `weather-pulse-preferences`.

Stored data includes:

- Last searched city.
- Temperature units (`metric` or `imperial`).
- Favorite cities list.

When the page loads, the app restores the saved state so the dashboard opens with the user’s previous settings.

## Architecture

The app follows a simple modular architecture:

- `app.js` is the controller layer.
- `api.js` is the data layer.
- `storage.js` is the persistence layer.

This separation keeps the code easier to maintain and makes each file focused on one responsibility.

## Testing Evidence

The project was validated through browser-based manual testing and runtime checks.

### Test Cases

- Load the page from a local server and confirm the dashboard renders.
- Search for a valid city and confirm current weather updates.
- Switch from metric to imperial and confirm values update.
- Save and remove favorite cities.
- Use browser geolocation and confirm the app loads weather for the current location.
- Refresh the page and confirm preferences persist through Local Storage.
- Confirm loading and error messages appear when requests are in progress or fail.

### Validation Performed

- Confirmed all JavaScript modules load successfully in the browser.
- Verified the initial city loads on page start.
- Verified the unit toggle updates temperatures and wind speed correctly.
- Confirmed the loading overlay does not block interaction when hidden.

## API Documentation

### 1. Geocoding Search

Endpoint:

`GET https://geocoding-api.open-meteo.com/v1/search`

Purpose:

- Converts a city name into latitude and longitude.

Important query parameters used:

- `name` — city name entered by the user.
- `count=1` — only the best match is needed.
- `language=en` — English result labels.
- `format=json` — JSON response.

Example:

```text
https://geocoding-api.open-meteo.com/v1/search?name=London&count=1&language=en&format=json
```

### 2. Weather Forecast

Endpoint:

`GET https://api.open-meteo.com/v1/forecast`

Purpose:

- Returns current conditions and daily forecast data for a set of coordinates.

Important query parameters used:

- `latitude` and `longitude` — resolved from the geocoding response.
- `current_weather=true` — includes current weather.
- `daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max`.
- `hourly=relativehumidity_2m,visibility`.
- `forecast_days=7` — provides enough data to render 5 days.
- `timezone=auto` — matches the user’s local region.
- `temperature_unit` — switches with the UI units setting.
- `wind_speed_unit` — switches with the UI units setting.

Example:

```text
https://api.open-meteo.com/v1/forecast?latitude=51.5072&longitude=-0.1276&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=relativehumidity_2m,visibility&forecast_days=7&timezone=auto
```

## Submission Structure

- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/api.js`
- `js/storage.js`
- `README.md`
- `screenshots/`

## Notes

- If geolocation is blocked, the search form still works normally.
- The saved cities list is capped so Local Storage stays tidy.
- Add screenshots to `screenshots/` and reference them in your final submission if needed.
