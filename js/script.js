// ==== CONFIG ====
const apiKey = "9834e32995d82b23c2c0d248e01f468c";
const weatherEl = document.getElementById("weatherResult");
const loaderEl  = document.getElementById("loader");
const errorEl   = document.getElementById("error");

// ==== THEME TOGGLE ====
function toggleMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark":"light");
}
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// ==== HELPERS ====
function showLoader(){ loaderEl.style.display = "block"; }
function hideLoader(){ loaderEl.style.display = "none"; }

// ==== DISPLAY FUNCTIONS ====
function displayWeather(data) {
  errorEl.textContent = "";
  const cond = data.weather[0].main;
  const temp = data.main.temp.toFixed(1);
  const iconCode = data.weather[0].icon;
  const desc     = data.weather[0].description;

  weatherEl.innerHTML = `
   <div class="weather-icon">
     <img src="https://openweathermap.org/img/wn/${iconCode}@4x.png"
          alt="${desc}" title="${desc}">
    </div>
    <h2>${data.name}, ${data.sys.country}</h2>
    <p>${cond}: ${temp}°C</p>
    <p>💧 ${data.main.humidity}%  💨 ${data.wind.speed} m/s</p>
    <p>Last updated: ${new Date(data.dt * 1000).toLocaleString()}</p>`;
}

function displayForecast(data) {
  const fc = document.getElementById("forecast-cards");
  fc.innerHTML = "";
  const daily = data.list.filter((_, i) => i % 8 === 0);

  daily.forEach(e => {
    const date = new Date(e.dt_txt).toLocaleDateString(undefined, {
      weekday:"short", month:"short", day:"numeric"
    });
    const iconCode = e.weather[0].icon;
    const desc     = e.weather[0].description;
    const t        = e.main.temp.toFixed(1);

fc.innerHTML += `
  <div class="forecast-card">
    <h4>${date}</h4>
    <div class="weather-icon">
      <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png"
           alt="${desc}" title="${desc}">
    </div>
    <p>${t}°C</p>
  </div>
`;

  });
}

// ==== FETCH FUNCTIONS ====
async function fetchWeather(city) {
  showLoader(); errorEl.textContent = "";
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    displayWeather(data);
    fetchForecast(city);
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    hideLoader();
  }
}

async function fetchForecast(city) {
  showLoader();
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!res.ok) throw new Error("Forecast unavailable");
    const data = await res.json();
    displayForecast(data);
  } catch (err) {
    console.warn(err);
  } finally {
    hideLoader();
  }
}

// ==== MANUAL SEARCH ====
function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (city) fetchWeather(city);
  else errorEl.textContent = "Please enter a city.";
}

// ==== AUTO LOCATION ON LOAD ====
window.addEventListener("DOMContentLoaded", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    });
  }
});

async function fetchWeatherByCoords(lat, lon) {
  showLoader();
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    if (!res.ok) throw new Error("Geo location failed");
    const data = await res.json();
    displayWeather(data);

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastRes.json();
    displayForecast(forecastData);

  } catch (err) {
    console.warn(err);
  } finally {
    hideLoader();
  }
}
