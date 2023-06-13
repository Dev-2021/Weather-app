"use strict";

const container = document.querySelector(".weather_data");
const inputSearch = document.querySelector("#search_input");
const btnSearch = document.querySelector("#search_button");
const btnPosition = document.querySelector("#search_position");
const error = document.querySelector(".error");
const url = `https://api.openweathermap.org/data/2.5/weather?`;
const apiKey = "86067f94548a0e2448d58c67ed2aeb8c";

//helper function
function handleError(msg) {
  error.textContent = `${msg}`;
  error.style.display = "block";
  setTimeout(() => {
    error.style.display = "none";
  }, 5000);
}
//get position
function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (err) => reject(handleError(`couldn't get current position`))
    );
  });
}

//get weather for current position
async function currentPosition() {
  const { latitude: lat, longitude: lon } = await getPosition();
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&`
    );
    if (!res.ok) throw new Error(res.message);

    const data = await res.json();
    getWeather(data.name);
  } catch (err) {
    handleError(err.message);
  }
}

btnPosition.addEventListener("click", () => {
  btnPosition.querySelector("svg").classList.add("active");
  currentPosition();
});
currentPosition();

btnSearch.addEventListener("click", () => {
  if (!inputSearch.value) {
    handleError("Please enter a city name");
  }
  const city = inputSearch.value;
  getWeather(city);
});
inputSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !inputSearch.value) {
    handleError("Please enter a city name");
  }
  if (e.key === "Enter" && inputSearch.value) {
    const city = inputSearch.value;
    getWeather(city);
  }
});

async function getWeather(city) {
  try {
    const res = await fetch(url + `q=${city}&appid=${apiKey}&units=metric`);
    if (!res.ok)
      throw new Error("Could not get weather, enter a correct city name");
    const data = await res.json();
    console.log(data);
    generateHtml(data);
  } catch (err) {
    handleError(`${err.message}`);
  }
}

const generateHtml = function (data) {
  container.innerHTML = "";
  const html = `
  <img class="weather_img" src="https://openweathermap.org/img/wn/${
    data.weather[0].icon
  }@2x.png" alt="${data.weather[0].description}">
  <div class="weather_description">${data.weather[0].main}</div>
                <div class="temp">${Math.round(
                  data.main.temp
                )}<span class="temp_unit">°C</span></div>
                <div class="feel_like text-description">Feels like: ${
                  data.main.feels_like
                }</div>
                 <div class="min_max-temp"><span class="max text-description">H: ${
                   data.main.temp_max
                 }</span><span class="min text-description">L: ${
    data.main.temp_min
  }</span>
                 </div>
                <div class="city">${data.name}, ${data.sys.country}</div>
                <div class="information">
                    <div class="info humidity">
                        <div class="icon">
                            <svg class="icons">
                                <use xlink:href="icons/sprite.svg#moisture"></use>
                            </svg>
                        </div>
                        <div class="info_text">${data.main.humidity}%</div>
                    </div>
                    <div class="info windspeed">
                        <div class="icon">
                            <svg class="icons">
                                <use xlink:href="icons/sprite.svg#wind"></use>
                            </svg>
                        </div>
                        <div class="info_text">${data.wind.speed} Km/h</div>
                    </div>
                </div>
    `;

  container.insertAdjacentHTML("beforeend", html);
};
