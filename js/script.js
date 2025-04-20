const themeToggle = document.getElementById("theme-toggle");

// On click, toggle dark-mode class and update button icon + localStorage
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// On page load, apply saved theme
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  }
});

const loader = document.getElementById("loader");

function showLoader() {
  loader.style.display = "block";
}

function hideLoader() {
  loader.style.display = "none";
}

// Weather API
const apiKey = "9834e32995d82b23c2c0d248e01f468c"; 
const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?appid=9834e32995d82b23c2c0d248e01f468c&units=metric`;


// NEW: displayWeather takes the API response and updates the UI
function displayWeather(data) {
  const result = document.getElementById("weatherResult");
  result.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p>🌡️ Temp: ${data.main.temp} °C</p>
    <p>☁️ Weather: ${data.weather[0].description}</p>
    <p>💨 Wind: ${data.wind.speed} m/s</p>
  `;
}

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  const res = await fetch(url);
  const data = await res.json();
  if (data.cod === 200) {
  displayWeather(data);
  fetchForecast(city); // ADD THIS
}
 else {
    document.getElementById("weatherResult").innerText = "City not found!";
  }
}

async function fetchWeather(city) {
  showLoader();
  try {
    const response = await fetch(`${API_URL}&q=${city}`);
    if (!response.ok) {
      throw new Error("City not found");
    }
    const data = await response.json();
    displayCurrentWeather(data);
    fetchForecast(city);
  } catch (error) {
    alert(error.message || "Failed to fetch weather data.");
  } finally {
    hideLoader();
  }
}

async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod === 200) {
      displayWeather(data);
      // Optional: trigger forecast
      fetchForecast(data.name);
    } else {
      console.error("Geo fetch error:", data);
    }
  } catch (err) {
    console.error("Network error:", err);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (err) => {
        console.warn("Geolocation denied or failed:", err);
      }
    );
  }
});

async function fetchForecast(city) {
  showLoader();
  try {
    const response = await fetch(`${FORECAST_API_URL}&q=${city}`);
    if (!response.ok) {
      throw new Error("Forecast not available.");
    }
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    alert(error.message || "Could not fetch forecast data.");
  } finally {
    hideLoader();
  }
}

function displayForecast(data) {
  const forecastContainer = document.getElementById("forecast-cards");
  forecastContainer.innerHTML = ""; // Clear old cards

  // One forecast every 8th item (~1 per day)
  const dailyData = data.list.filter((_, index) => index % 8 === 0);

  dailyData.forEach((entry) => {
    const date = new Date(entry.dt_txt).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric"
    });

    const icon = entry.weather[0].icon;
    const temp = entry.main.temp;
    const desc = entry.weather[0].description;

    const card = `
      <div class="forecast-card">
        <h4>${date}</h4>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" />
        <p>${temp} °C</p>
        <small>${desc}</small>
      </div>
    `;

    forecastContainer.innerHTML += card;
  });
}
