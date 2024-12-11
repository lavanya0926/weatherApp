let apiKey = 'EJ6UBL2JEQGYB3AA4ENASN62J';
let weatherApi = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
let geoApi = 'https://geolocation-db.com/json/';

let conditionAssets = {
    "partly-cloudy-day": {
        icon: "https://i.ibb.co/PZQXH8V/27.png",
        background: "https://i.ibb.co/qNv7NxZ/pc.webp"
    },
    "cloudy": {
        icon: "https://i.ibb.co/PZQXH8V/27.png",
        background: "https://i.ibb.co/qNv7NxZ/pc.webp"
    },
    "fog": {
        icon: "https://i.ibb.co/PZQXH8V/27.png",
        background: "https://i.ibb.co/qNv7NxZ/pc.webp"
    },
    "snow": {
        icon: "https://i.ibb.co/PZQXH8V/27.png",
        background: "https://i.ibb.co/qNv7NxZ/pc.webp"
    },
    "partly-cloudy-night": {
        icon: "https://i.ibb.co/Kzkk59k/15.png",
        background: "https://i.ibb.co/RDfPqXz/pcn.jpg"
    },
    "rain": {
        icon: "https://i.ibb.co/kBd2NTS/39.png",
        background: "https://i.ibb.co/h2p6Yhd/rain.webp"
    },
    "clear-day": {
        icon: "https://i.ibb.co/rb4rrJL/26.png",
        background: "https://i.ibb.co/WGry01m/cd.jpg"
    },
    "clear-night": {
        icon: "https://i.ibb.co/1nxNGHL/10.png",
        background: "https://i.ibb.co/kqtZ1Gx/cn.jpg"
    }
};

let currentUnit = 'C'
function convertTemperature(temp, unit) {
    return unit === 'F' ? (temp * 9) / 5 + 32 : temp;
}

function setActiveUnit(unit, data) {
    currentUnit = unit;
    document.getElementById('celsius').classList.toggle('active', unit === 'C')
    document.getElementById('fahrenheit').classList.toggle('active', unit === 'F')
    document.getElementById('celsius').style.backgroundColor = unit === 'C' ? 'grey' : 'transparent'
    document.getElementById('fahrenheit').style.backgroundColor = unit === 'F' ? 'grey' : 'transparent'

    updateCurrentWeather(data)
    updateHighlights(data)
    if (document.getElementById('weekTab').classList.contains('active')) {
        updateWeeklyForecast(data)
    }
    else {
        updateHourlyForecast(data)
    }
}

function updateCurrentWeather(data) {
    let today = data.days[0]
    let weatherElement = document.getElementById('currentWeather')
    let temp = convertTemperature(today.temp, currentUnit)
    let condition = today.icon

    let weatherIcon = conditionAssets[condition]?.icon || 'https://i.ibb.co/default-icon.png';
    let backgroundImage = conditionAssets[condition]?.background || 'https://i.ibb.co/default-bg.webp';
    document.body.style.backgroundImage = `url('${backgroundImage}')`;
    weatherElement.innerHTML = `
          <img src="${weatherIcon}" alt="${condition}" id="img">
          <h1>${Math.round(temp)}°${currentUnit}</h1>
          <hr id="hr">
          <p>${today.conditions}</p>
          <p>Percip:${today.percip || 0}%</p>
          <p>${data.resolvedAddress}</p>
    `
    let img = document.getElementById('img')
    img.style.maxWidth = "150px"

    let hr = document.getElementById('hr')
    hr.style.width = "180px"
}

function updateDateTime() {
    let dateTimeElement = document.getElementById('dateTimePanel')
    let now = new Date();
    let day = now.toLocaleDateString(undefined, { weekday: 'long' });
    let time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace("am", "AM").replace("pm", "PM");
    dateTimeElement.innerHTML = `
    <h2>${day}</h2>
    <h3>${time}</h3>
    `
}
setInterval(updateDateTime, 1000)
setInterval(updateDateTime, 1000)


function updateHourlyForecast(data) {
    let forecastElement = document.getElementById('hourlyForecast')
    forecastElement.innerHTML = data.days[0].hours.slice(0, 24).map(hour => {
        let temp = convertTemperature(hour.temp, currentUnit)
        let condition = hour.icon;
        let forecastDate = data.days[0].datetime.split("T")[0];
        let fullDateTime = `${forecastDate}T${hour.datetime}`;
        let datetime = new Date(fullDateTime);

        if (isNaN(datetime.getTime())) {
            console.error('Invalid date format:', fullDateTime);
            return '';
        }
        let time12Hour = datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace("am", "AM").replace("pm", "PM");;
        let weatherIcon = conditionAssets[condition]?.icon || 'https://i.ibb.co/default-icon.png';
        return `
               <div>
                  <p><b>${time12Hour}</b></p>
                 <img src="${weatherIcon}" alt="${condition}" />
                <b>${Math.round(temp)}°${currentUnit}</b>
               </div>
           `;
    }).join('');
}

function updateWeeklyForecast(data) {
    let forecastElement = document.getElementById('hourlyForecast')
    forecastElement.innerHTML = data.days.slice(0, 7).map(day => {
        let temp = convertTemperature(day.temp, currentUnit);
        return `
          <div>
            <b>${new Date(day.datetime).toLocaleDateString([], { weekday: 'long' })}</b>
            <img src="${conditionAssets[day.icon]?.icon || 'https://i.ibb.co/default-icon.png'}" alt="${day.icon}" />
            <b>${Math.round(temp)}°${currentUnit}</b>
           </div>

        `
    }).join('')
}

function updateHighlights(data) {
    let today = data.days[0]
    let highlightsElement = document.getElementById('highlights')
    let formatTime = (timeString) => {
        let [hour, minute] = timeString.split(':')
        let formattedHour = (parseInt(hour) % 12) || 12;
        let period = parseInt(hour) >= 12 ? 'pm' : 'am'
        return `
        ${formattedHour}:${minute} ${period}
        `
    };
    let sunriseTime = formatTime(today.sunrise)
    let sunsetTime = formatTime(today.sunset)

    let uvCategory = ''
    if (today.uvindex <= 2) {
        uvCategory = 'Low'
    }
    else if (today.uvindex <= 5) {
        uvCategory = "moderate"
    } else if (today.uvindex <= 7) {
        uvCategory = 'High'
    } else if (today.uvindex <= 10) {
        uvCategory = 'very High'
    } else {
        uvCategory = 'Extreme'
    }

    let visibilityCategory = ''
    if (today.visibility >= 10) {
        visibilityCategory = 'Clear Air'
    } else if (today.visibility >= 5) {
        visibilityCategory = 'Clear'
    } else if (today.visibility >= 1) {
        visibilityCategory = 'Moderate'
    } else {
        visibilityCategory = 'Poor'
    }


    let humidityCategory = ''
    if (today.humidity < 30) {
        humidityCategory = "Dry"
    } else if (today.humidity <= 60) {
        humidityCategory = "Comfortable"
    } else if (today.humidity <= 80) {
        humidityCategory = "Humid"
    } else {
        humidityCategory = "very Humid"
    }



    let airQualityCategory = '';
    let aqiValue = today.airQuality || 280;
    if (aqiValue >= 0 && aqiValue <= 50) {
        airQualityCategory = 'Good 👌';
    } else if (aqiValue > 50 && aqiValue <= 100) {
        airQualityCategory = 'Moderate 😐';
    } else if (aqiValue > 100 && aqiValue <= 150) {
        airQualityCategory = 'Unhealthy for Sensitive Groups 😷';
    } else if (aqiValue > 150 && aqiValue <= 200) {
        airQualityCategory = 'Unhealthy 😷';
    } else if (aqiValue > 200 && aqiValue < 280) {
        airQualityCategory = 'Very Unhealthy 😨';
    } else {
        airQualityCategory = 'Hazardous 😱';
    }



    highlightsElement.innerHTML = `
        <div>
           <h4>UV Index</h4>
           <span>${today.uvindex}</span>
           <p id="uv">${uvCategory}</p>
        </div>
        <div>
           <h4>Wind Status</h4>
           <span>${today.windspeed}</span>
           <p id="wind">km/h</p>
        </div>
        <div>
           <h4>Sunrise&Sunset</h4>
           <span>${sunriseTime}</span>
           <p id="sun">${sunsetTime}</p>
        </div>
        <div>
          <h4>Humidity</h4>
          <span>${today.humidity}</span>
          <p id="humidity">${humidityCategory}</p>
        </div>
        <div>
           <h4>Visibility</h4>
           <span>${today.visibility}</span>
           <p id="visibility">${visibilityCategory}</p>
        </div>
        <div>
            <h4>Air Quality</h4>
            <span>${aqiValue}</span>
            <p id="airQuality">${airQualityCategory}</p>
        </div>
    `;

    let h4 = document.querySelectorAll('h4');
    h4.forEach(h4 => {
        h4.style.color = 'grey';
        h4.style.marginRight = '180px';
    });

    let spanElements = document.querySelectorAll('span');
    spanElements.forEach(span => {
        span.style.fontSize = 'xx-large';
    });

    let uv = document.getElementById('uv');
    uv.style.marginRight = '180px';
    uv.style.fontSize = 'medium';
    uv.style.marginTop = '20px';

    let wind = document.getElementById('wind');
    wind.style.marginRight = '180px';
    wind.style.fontSize = 'medium';
    wind.style.marginTop = '20px';

    let sun = document.getElementById('sun');
    sun.style.marginRight = '180px';
    sun.style.fontSize = 'medium';
    sun.style.marginTop = '25px';

    let humidity = document.getElementById('humidity');
    humidity.style.marginRight = '180px';
    humidity.style.fontSize = 'medium';
    humidity.style.marginTop = '20px';

    let visibility = document.getElementById('visibility');
    visibility.style.marginRight = '180px';
    visibility.style.fontSize = 'medium';
    visibility.style.marginTop = '20px';

    let airQuality = document.getElementById('airQuality');
    airQuality.style.marginRight = '180px';
    airQuality.style.fontSize = 'medium';
    airQuality.style.marginTop = '20px';

}

async function fetchWeather(city) {
    try {
        let response = await fetch(`${weatherApi}${city}?unitGroup=metric&key=${apiKey}&contentType=json`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}
async function fetchLocation() {
    try {
        let response = await fetch(geoApi)
        let data = await response.json()
        return data.city || "Pune"
    }
    catch (error) {
        return "Pune"
    }
}
async function displayWeather(city) {
    let weatherData = await fetchWeather(city);
    if (!weatherData) {
        alert("Invalid City.Enter a valid city Name");
        return;
    }
    updateHourlyForecast(weatherData)
    updateCurrentWeather(weatherData);
    updateWeeklyForecast(weatherData);
    updateHighlights(weatherData);

    document.getElementById('weekTab').addEventListener('click', () => {
        setActiveTab('weekTab')
        updateWeeklyForecast(weatherData)
    })

    document.getElementById('todayTab').addEventListener('click', () => {
        setActiveTab('todayTab')
        updateHourlyForecast(weatherData)
    })

    document.getElementById('celsius').addEventListener('click', () => {
        setActiveUnit('C', weatherData);
    });

    document.getElementById('fahrenheit').addEventListener('click', () => {
        setActiveUnit('F', weatherData);
    });
}

function setActiveTab(tabId) {
    document.getElementById('todayTab').classList.remove('active')
    document.getElementById('weekTab').classList.remove('active')
    document.getElementById(tabId).classList.add('active')
}

(async function () {
    let city = await fetchLocation();
    displayWeather(city);

    document.getElementById('i').addEventListener('click', () => {
        let newCity = document.getElementById('cityInput').value.trim();
        if (newCity) {
            displayWeather(newCity);
        }
    });
})();
