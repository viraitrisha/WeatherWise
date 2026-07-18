const apiKey = CONFIG.apiKey;
const geoUrl = CONFIG.geoUrl;
const weatherUrl = CONFIG.weatherUrl;

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
const scrollTopBtn = document.getElementById("scrollTopBtn");

let currentTimezoneOffset = 0;
let clockInterval = null;
let currentWeatherData = null;

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
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const weekday = days[localTime.getUTCDay()];
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

function updateClockAndDate() {
    if (currentTimezoneOffset === undefined) return;
    const nowUtc = Math.floor(Date.now() / 1000);
    const timeStr = formatLocalTime(nowUtc, currentTimezoneOffset, "time");
    const dateStr = formatLocalTime(nowUtc, currentTimezoneOffset, "date");
    if (clockEl) clockEl.innerText = timeStr;
    if (dateEl) dateEl.innerText = dateStr;

    const utcDate = new Date(nowUtc * 1000);
    const localHour = new Date(utcDate.getTime() + currentTimezoneOffset * 1000).getUTCHours();
    setBodyTheme(localHour);
}

function setBodyTheme(hour) {
    document.body.classList.remove("morning", "day", "evening", "night");
    if (hour >= 5 && hour < 12) {
        document.body.classList.add("morning");
    } else if (hour >= 12 && hour < 17) {
        document.body.classList.add("day");
    } else if (hour >= 17 && hour < 20) {
        document.body.classList.add("evening");
    } else {
        document.body.classList.add("night");
    }
}

function startClock() {
    if (clockInterval) clearInterval(clockInterval);
    updateClockAndDate();
    clockInterval = setInterval(updateClockAndDate, 1000);
}

function getWeatherIconClass(iconCode) {
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

function updateUIWithWeather(data) {
    if (!data) return;
    currentWeatherData = data;

    const city = data.name;
    const country = data.sys?.country ? `, ${data.sys.country}` : "";
    if (cityNameEl) cityNameEl.innerText = city + country;

    if (temperatureEl) temperatureEl.innerText = `${Math.round(data.main.temp)}°C`;
    if (feelsLikeEl) feelsLikeEl.innerText = `Feels like ${Math.round(data.main.feels_like)}°C`;
    if (humidityEl) humidityEl.innerText = `${data.main.humidity}%`;

    const windKmh = (data.wind.speed * 3.6).toFixed(1);
    if (windEl) windEl.innerText = `${windKmh} km/h`;

    if (pressureEl) pressureEl.innerText = `${data.main.pressure} hPa`;

    const visibilityKm = (data.visibility / 1000).toFixed(1);
    if (visibilityEl) visibilityEl.innerText = `${visibilityKm} km`;

    const iconCode = data.weather[0].icon;
    const faClass = getWeatherIconClass(iconCode);
    if (weatherIconElement) {
        weatherIconElement.className = `fas ${faClass}`;
    }

    currentTimezoneOffset = data.timezone;
    startClock();
}

function showLoading(show) {
    if (show) {
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i>';
    } else {
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    }
}

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

// ----- Fetch weather by city name -----
async function fetchWeatherByCity(cityName) {
    if (!cityName.trim()) return;
    showLoading(true);
    try {
        const geoResp = await fetch(`${geoUrl}?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}`);
        const geoData = await geoResp.json();
        if (!geoData.length) throw new Error("City not found");
        const { lat, lon, name, country } = geoData[0];

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

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

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
if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", scrollToTop);
}

function initApp() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, "Current Location"),
            () => fetchWeatherByCity("Paramaribo")
        );
    } else {
        fetchWeatherByCity("Paramaribo");
    }
}

initApp();

(function autoScrollGrid() {
    const container = document.querySelector('.notes-grid');
    if (!container) return;

    let scrollAmount = 0;
    const step = 1.2;
    let direction = 1;
    let scrollInterval;

    function scroll() {
        if (!container) return;
        scrollAmount += step * direction;
        container.scrollLeft = scrollAmount;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (scrollAmount >= maxScroll) {
            direction = -1;
            scrollAmount = maxScroll;
        } else if (scrollAmount <= 0) {
            direction = 1;
            scrollAmount = 0;
        }
    }

    function startScrolling() {
        if (scrollInterval) clearInterval(scrollInterval);
        scrollInterval = setInterval(scroll, 30);
    }

    function stopScrolling() {
        clearInterval(scrollInterval);
    }

    startScrolling();
    container.addEventListener('mouseenter', stopScrolling);
    container.addEventListener('mouseleave', startScrolling);
})();