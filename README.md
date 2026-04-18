Here's a complete README.md for your **WeatherWise** web application, using proper Markdown formatting including headers, code blocks, inline code, and lists.

```markdown
# WeatherWise

**Live anywhere, feel the sky** – a real‑time weather dashboard that travels with you. Get current conditions, local time, and micro‑climate insights for any city in the world.

![WeatherWise Screenshot](https://via.placeholder.com/800x400?text=WeatherWise+Demo)  
*(Add your own screenshot here)*

## Features

- 🌍 **Search any city** – get temperature, feels like, humidity, wind speed, pressure, and visibility
- 🕒 **Live local clock** – automatically adjusts to the searched city’s timezone
- 🌤️ **Dynamic themes** – background and accent colors change based on the local time of day (morning, day, evening, night)
- 📍 **Geolocation support** – one‑click button to fetch weather for your current location
- 💡 **Micro‑climate tips** – scrollable cards with helpful weather‑related advice
- 📅 **Formatted local date** – shows day of week, date, month, and year
- 🖱️ **Auto‑scrolling notes grid** – pauses on hover, resumes afterwards

## Demo

You can try the live version at: [https://your-username.github.io/WeatherWise](https://your-username.github.io/WeatherWise) *(replace with your actual URL)*

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- An internet connection (to fetch weather data and fonts)
- **OpenWeatherMap API key** – [get one for free](https://home.openweathermap.org/users/sign_up)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/viraitrisha/WeatherWise.git
   cd WeatherWise
   ```

2. **Get your API key**
   - Sign up at [OpenWeatherMap](https://home.openweathermap.org/users/sign_up)
   - Navigate to the **API Keys** tab and copy your key

3. **Insert the API key**  
   Open `app.js` and replace the placeholder with your key:
   ```javascript
   const apiKey = "YOUR_API_KEY_HERE";
   ```

4. **Run the app locally**  
   Because the app uses JavaScript modules and fetches external APIs, you need to serve it via a local web server.  
   *Option A – using VS Code Live Server:*  
   - Install the “Live Server” extension, right‑click `index.html` → **Open with Live Server**  

   *Option B – using Python:*  
   ```bash
   # Python 3
   python -m http.server 8000
   # then visit http://localhost:8000
   ```

   *Option C – simply double‑clicking `index.html` may work, but some browsers block geolocation and API calls over `file://`*

### File Structure

```
WeatherWise/
├── index.html          # Main HTML structure
├── main.css            # All styles + responsive design
├── app.js              # Weather fetching, clock, themes, auto‑scroll
├── images/
│   └── cloud-sun-solid-full.svg   # Favicon
└── README.md           # This file
```

## Usage

1. **Search for a city**  
   Type a city name (e.g., “Tokyo”, “London”, “New York”) in the search bar and press Enter or click the 🔍 button.

2. **Use your current location**  
   Click the 📍 button – the browser will ask for permission, then show weather for your coordinates.

3. **Read the tips**  
   Hover over the auto‑scrolling note cards to pause and read micro‑climate advice.

4. **Watch the clock**  
   The displayed time and date will update every second and match the selected city’s timezone.

## Built With

- **HTML5** – semantic structure
- **CSS3** – custom properties (CSS variables) for dynamic theming, Flexbox & Grid
- **JavaScript (ES6+)** – Fetch API, geolocation, interval timers
- **OpenWeatherMap API** – current weather data & geocoding
- **Font Awesome 6.5.2** – icons for weather, buttons, and cards
- **Google Fonts (Inter)** – modern sans‑serif typeface

## Configuration

### Changing the default fallback city

If geolocation fails or is denied, the app falls back to **Paramaribo**.  
Edit `initApp()` in `app.js`:

```javascript
function initApp() {
  // ...
  fetchWeatherByCity("YourDefaultCity");
}
```

### Adjusting theme hours

The theme changes based on local hour (0‑23). Modify `setBodyTheme(hour)` in `app.js`:

```javascript
if (hour >= 5 && hour < 12) → morning
else if (hour >= 12 && hour < 17) → day
else if (hour >= 17 && hour < 20) → evening
else → night
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-idea`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-idea`)
5. Open a Pull Request

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [FontAwesome](https://fontawesome.com/)
- Favicon from [FontAwesome solid cloud‑sun](https://fontawesome.com/icons/cloud-sun)

## Known Issues & Roadmap

- **UV index & radar** – planned for future releases (currently only static tips)
- **5‑day forecast** – will be added in v2
- **Unit toggle (°C/°F)** – under consideration

Feel free to report bugs via [GitHub Issues](https://github.com/viraitrisha/WeatherWise/issues).

---

*Made by Viraitrisha*
```