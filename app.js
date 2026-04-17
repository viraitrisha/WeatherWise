const apiKey = "bd6c98a02a3b7b02d5683bbd8493c74d";
const geoUrl = "https://api.openweathermap.org/geo/1.0/direct";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather";

// ----- DOM Elements (matching your HTML) -----
const searchInput = document.querySelector(".search-bar");
const searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector(".location-btn");
const cityNameEl = document.querySelector(".weather-location .location");
const temperatureEl = document.querySelector(".temperature");
const feelsLikeEl = document.querySelector(".feels p");
const humidityEl = document.querySelector(".humid");
const windEl = document.querySelector(".wind");
const pressureEl = document.querySelector(".press");
const visibilityEl = document.querySelector(".visible");
const weatherIconElement = document.querySelector(".weather-icon i");
const dateEl = document.querySelector(".date");
const clockEl = document.querySelector(".time");

// ----- State -----
let currentTimezoneOffset = 0;      // seconds from UTC
let clockInterval = null;
let currentWeatherData = null;

// ----- Helper: Format local time (HH:MM:SS AM/PM) -----
function formatLocalTime(timestamp, offsetSeconds, format = "time") {
    const utcDate = new Date(timestamp * 1000);
    const localTime = new Date(utcDate.getTime() + offsetSeconds * 1000);
    if (format === "time") {
        let hours = localTime.getUTCHours();
        const minutes = localTime.getUTCMinutes().toString().padStart(2, "0");
        const seconds = localTime.getUTCSeconds().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours.toString().padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
    } else if (format === "date") {
        const year = localTime.getUTCFullYear();
        const month = localTime.getUTCMonth();
        const day = localTime.getUTCDate();
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        // Get day of week
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const weekday = days[localTime.getUTCDay()];
        // Ordinal suffix
        const suffix = (day) => {
            if (day > 3 && day < 21) return "th";
            switch (day % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };
        return `${weekday}, ${day}${suffix(day)} of ${months[month]} ${year}`;
    }
    return "";
}

// ----- Update Clock & Date using current timezone offset -----
function updateClockAndDate() {
    if (currentTimezoneOffset === undefined) return;
    const nowUtc = Math.floor(Date.now() / 1000);
    const timeStr = formatLocalTime(nowUtc, currentTimezoneOffset, "time");
    const dateStr = formatLocalTime(nowUtc, currentTimezoneOffset, "date");
    if (clockEl) clockEl.innerText = timeStr;
    if (dateEl) dateEl.innerText = dateStr;
    
    // Update body theme based on local hour (0-23)
    const utcDate = new Date(nowUtc * 1000);
    const localHour = new Date(utcDate.getTime() + currentTimezoneOffset * 1000).getUTCHours();
    setBodyTheme(localHour);
}

// ----- Set body class for time of day (matches CSS expectations) -----
function setBodyTheme(hour) {
    // Remove existing theme classes
    document.body.classList.remove("morning", "day", "evening", "night");
    if (hour >= 5 && hour < 12) {
        document.body.classList.add("morning");
        // Also keep your existing "morning" class if needed
        document.body.classList.add("morning");
    } else if (hour >= 12 && hour < 17) {
        document.body.classList.add("day");
    } else if (hour >= 17 && hour < 20) {
        document.body.classList.add("evening");
    } else {
        document.body.classList.add("night");
    }
}

// ----- Start/refresh clock ticker -----
function startClock() {
    if (clockInterval) clearInterval(clockInterval);
    updateClockAndDate();
    clockInterval = setInterval(updateClockAndDate, 1000);
}

// ----- Map OpenWeatherMap icon code to FontAwesome class -----
function getWeatherIconClass(iconCode, description) {
    const iconMap = {
        "01d": "fa-sun",
        "01n": "fa-moon",
        "02d": "fa-cloud-sun",
        "02n": "fa-cloud-moon",
        "03d": "fa-cloud",
        "03n": "fa-cloud",
        "04d": "fa-cloud",
        "04n": "fa-cloud",
        "09d": "fa-cloud-rain",
        "09n": "fa-cloud-rain",
        "10d": "fa-cloud-sun-rain",
        "10n": "fa-cloud-moon-rain",
        "11d": "fa-bolt",
        "11n": "fa-bolt",
        "13d": "fa-snowflake",
        "13n": "fa-snowflake",
        "50d": "fa-smog",
        "50n": "fa-smog"
    };
    return iconMap[iconCode] || "fa-cloud";
}

// ----- Update entire UI with weather data -----
function updateUIWithWeather(data) {
    if (!data) return;
    currentWeatherData = data;
    
    // City & country
    const city = data.name;
    const country = data.sys?.country ? `, ${data.sys.country}` : "";
    if (cityNameEl) cityNameEl.innerText = city + country;
    
    // Temperature
    if (temperatureEl) temperatureEl.innerText = `${Math.round(data.main.temp)}°C`;
    
    // Feels like
    if (feelsLikeEl) feelsLikeEl.innerText = `Feels like ${Math.round(data.main.feels_like)}°C`;
    
    // Humidity
    if (humidityEl) humidityEl.innerText = `${data.main.humidity}%`;
    
    // Wind speed (convert m/s to km/h)
    const windKmh = (data.wind.speed * 3.6).toFixed(1);
    if (windEl) windEl.innerText = `${windKmh} km/h`;
    
    // Pressure
    if (pressureEl) pressureEl.innerText = `${data.main.pressure} hPa`;
    
    // Visibility
    const visibilityKm = (data.visibility / 1000).toFixed(1);
    if (visibilityEl) visibilityEl.innerText = `${visibilityKm} km`;
    
    // Weather icon (FontAwesome)
    const iconCode = data.weather[0].icon;
    const faClass = getWeatherIconClass(iconCode, data.weather[0].description);
    if (weatherIconElement) {
        weatherIconElement.className = `fas ${faClass}`;
    }
    
    // Set timezone offset (seconds from UTC)
    currentTimezoneOffset = data.timezone;
    
    // Restart clock with new offset
    startClock();
}

// ----- Show loading indicator (simple text on search button) -----
function showLoading(show) {
    if (show) {
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i>';
    } else {
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    }
}

// ----- Fetch weather by coordinates -----
async function fetchWeatherByCoords(lat, lon, cityHint = "") {
    showLoading(true);
    try {
        const url = `${weatherUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather data error");
        const data = await response.json();
        updateUIWithWeather(data);
        if (cityHint && searchInput) searchInput.value = cityHint;
        else if (searchInput) searchInput.value = data.name;
    } catch (error) {
        console.error(error);
        if (cityNameEl) cityNameEl.innerText = "⚠️ Location error";
        if (feelsLikeEl) feelsLikeEl.innerText = "Feels like --°C";
    } finally {
        showLoading(false);
    }
}

// ----- Fetch weather by city name (geocoding first) -----
async function fetchWeatherByCity(cityName) {
    if (!cityName.trim()) return;
    showLoading(true);
    try {
        // Geocoding
        const geoResp = await fetch(`${geoUrl}?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}`);
        const geoData = await geoResp.json();
        if (!geoData.length) throw new Error("City not found");
        const { lat, lon, name, country } = geoData[0];
        
        // Weather
        const weatherResp = await fetch(`${weatherUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const weatherData = await weatherResp.json();
        if (!weatherResp.ok) throw new Error("Weather API error");
        updateUIWithWeather(weatherData);
        if (searchInput) searchInput.value = `${name}, ${country}`;
    } catch (error) {
        console.error(error);
        if (cityNameEl) cityNameEl.innerText = "❌ City not found";
        if (temperatureEl) temperatureEl.innerText = "--°C";
        if (feelsLikeEl) feelsLikeEl.innerText = "Feels like --°C";
    } finally {
        showLoading(false);
    }
}

// ----- Get current location via browser geolocation -----
function getCurrentLocationWeather() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }
    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude, "Your Location");
        },
        (error) => {
            showLoading(false);
            alert("Location access denied. Please search for a city manually.");
            console.warn(error);
        }
    );
}

// ----- Event Listeners -----
if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        const query = searchInput ? searchInput.value.trim() : "";
        if (query) fetchWeatherByCity(query.split(",")[0]);
    });
}
if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = searchInput.value.trim();
            if (query) fetchWeatherByCity(query.split(",")[0]);
        }
    });
}
if (locationBtn) {
    locationBtn.addEventListener("click", getCurrentLocationWeather);
}

// ----- Initialize: try geolocation, fallback to a default city (e.g., Paramaribo) -----
function initApp() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, "Current Location"),
            () => fetchWeatherByCity("Paramaribo")   // fallback
        );
    } else {
        fetchWeatherByCity("Paramaribo");
    }
}

// Start the app
initApp();