"use strict"
$(() => {

    // ------------ GLOBAL VARIABLES ------------
    let map;
    let marker;

    // ------------ OBJECTS ------------

    // DO NOT USE ARROW FUNCTIONS IN METHODS
    // THEY CANNOT USE THE THIS. FUNCTIONALITY

    // Map object and methods
    const Map = {
        // initializes map and marker global variables
        initialize() {
            // Access Token
            mapboxgl.accessToken = MAPBOX_KEY;
            // Create Map
            map = new mapboxgl.Map({
                container: 'map', // container ID
                style: 'mapbox://styles/mapbox/streets-v11', // style URL
                center: [-98.4946, 29.4252], // starting position [lng, lat]
                zoom: 9, // starting zoom
                projection: 'globe' // display the map as a 3D globe
            });
            map.on('style.load', () => {
                map.setFog({}); // Set the default atmosphere style
            });
            // Create Marker
            marker = new mapboxgl.Marker({
                draggable: true
            });
            // Set map and weather data to San Antonio
            User.searchAddress("San Antonio, Texas");
        },
        // updates marker based on coordinates
        updateMarker(coords) {
            marker.setLngLat(coords).addTo(map);
            Get.currentWeather(coords[1], coords[0]);
            Get.forecast(coords[1], coords[0]);
        }
    };
    // Get object and methods
    const Get = {
        // get forecast data then print to screen
        forecast(lat, lng) {
            // get request for forecast data
            $.get("http://api.openweathermap.org/data/2.5/forecast", {
                APPID: OPEN_WEATHER_APPID,
                lat: lat,
                lon: lng,
                units: "imperial"
                // takes data received and prints to screen
            }).done(data => {
                Print.tomorrowCard(data);
                Print.upcomingCards(data);
            });
        },
        // get current weather data then print to screen
        currentWeather(lat, lng) {
            // get request for current weather data
            $.get("http://api.openweathermap.org/data/2.5/weather", {
                APPID: OPEN_WEATHER_APPID,
                lat: lat,
                lon: lng,
                units: "imperial"
                // takes data received and prints to screen
            }).done(data => {
                Print.currentNavbar(data)
            });
        },
        // get and return coordinates from search query
        geocode(search, token) {
            let baseUrl = 'https://api.mapbox.com';
            let endPoint = '/geocoding/v5/mapbox.places/';
            return fetch(baseUrl + endPoint + encodeURIComponent(search) + '.json' + "?" + 'access_token=' + token)
                .then(function(res) {
                    return res.json();
                }).then(function(data) {
                    return data.features[0].center;
                });
        }
    };
    // Print object and methods
    const Print = {
        // receives forecast data and prints tomorrow card to screen
        tomorrowCard(data) {
            $("#upcoming-tomorrow-card").html(`
                <div class="card-header">Tomorrow's Forecast</div> 
                <ul class="list-group list-group-flush px-2">
                    <li class="list-group-item">High: ${Deduce.highTemp(data, 1)}&#8457;</li>
                    <li class="list-group-item">Low: ${Deduce.lowTemp(data, 1)}&#8457;</li>
                    <li class="list-group-item"><img src="http://openweathermap.org/img/w/${data.list[7].weather[0].icon}.png"> ${Pretty.capitalizeFirstLetters(data.list[7].weather[0].description)}</li>
                    <li class="list-group-item">Humidity: ${data.list[7].main.humidity}%</li>
                    <li class="list-group-item">Wind: ${parseInt(data.list[7].wind.speed)} mi/hr</li>
                    <li class="list-group-item">Pressure: ${data.list[7].main.pressure} hPa</li>
                    <li class="list-group-item">Sunrise: ${Pretty.time(data.city.sunrise)}</li>
                    <li class="list-group-item">Sunset: ${Pretty.time(data.city.sunset)}</li>
                </ul>
            `);
        },
        // receives forecast data and prints upcoming cards to screen
        upcomingCards(data) {
            for(let i=2; i<=5; i++) {
                $(`#upcoming-${i}-card`).html(`
                    <div class="card-header">${Pretty.date(data.list[i*8-1].dt_txt.substring(0, 10))}</div>
                    <ul class="list-group list-group-flush px-2">
                        <li class="list-group-item">${Deduce.highTemp(data, i)}&#8457; / ${Deduce.lowTemp(data, i)}&#8457;</li>
                        <li class="list-group-item"><img src="http://openweathermap.org/img/w/${data.list[i*8-1].weather[0].icon}.png"> ${Pretty.capitalizeFirstLetters(data.list[i*8-1].weather[0].description)}</li>
                        <li class="list-group-item">Humidity: ${data.list[i*8-1].main.humidity}%</li>
                        <li class="list-group-item">Wind: ${parseInt(data.list[i*8-1].wind.speed)} mi/hr</li>
                        <li class="list-group-item">Pressure: ${data.list[i*8-1].main.pressure} hPa</li>
                    </ul>
                `);
            }
        },
        // receives current weather data and prints navbar to screen
        currentNavbar(data) {
            $("#header-title").html(data.name);
            $("#current-icon").html(`<img src="http://openweathermap.org/img/w/${data.weather[0].icon}.png">`);
            $("#current-weather-description").html(Pretty.capitalizeFirstLetters(data.weather[0].description));
            $("#current-temp").html(`${parseInt(data.main.temp)} F`);
            $("#current-feels-like").html(`Feels Like ${parseInt(data.main.feels_like)} F`);
            $("#current-humidity").html(`${data.main.humidity}% Humidity`)
        }
    };
    // Pretty object and methods
    const Pretty = {
        // receives string and returns same string with first letters of each word capitalized
        capitalizeFirstLetters(str) {
            return str.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        },
        // receives date as numerical string and returns "{month name} dd, yyyy" format
        date(date) {
            let month;
            switch (date.substring(5, 7)) {
                case "01":
                    month = "January";
                    break;
                case "02":
                    month = "February";
                    break;
                case "03":
                    month = "March";
                    break;
                case "04":
                    month = "April";
                    break;
                case "05":
                    month = "May";
                    break;
                case "06":
                    month = "June";
                    break;
                case "07":
                    month = "July";
                    break;
                case "08":
                    month = "August";
                    break;
                case "09":
                    month = "September";
                    break;
                case "10":
                    month = "October";
                    break;
                case "11":
                    month = "November";
                    break;
                case "12":
                    month = "December";
                    break;
            }
            return `${month} ${date.substring(8, date.length)}, ${date.substring(0, 4)}`;
        },
        // receives timestamp and returns readable local time string
        time(timestamp) {
            let date = new Date((timestamp) * 1000);
            if (date.getHours() < 12) {
                return `${date.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${date.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})} AM`;
            } else {
                return `${(date.getHours()-12).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${date.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})} PM`;
            }
        }
    };
    // Deduce object and methods
    const Deduce = {
        // receives forecast weather and day, returns high temp
        highTemp(data, day) {
            let highTemp = -1000;
            for(let i=0; i<8; i++) {
                if(highTemp < data.list[i + (day*8) - 8].main.temp_max) {
                    highTemp = data.list[i + (day*8) - 8].main.temp_max;
                }
            }
            return parseInt(highTemp);
        },
        // receives forecast weather and day, returns low temp
        lowTemp(data, day) {
            let lowTemp = 1000;
            for(let i=0; i<8; i++) {
                if(lowTemp > data.list[i + (day*8) - 8].main.temp_min) {
                    lowTemp = data.list[i + (day*8) - 8].main.temp_min;
                }
            }
            return parseInt(lowTemp);
        }
    };
    // User object and methods
    const User = {
        // receives address string and gets coordinates then updates weather info and prints cards
        searchAddress(address) {
            Get.geocode(address, MAPBOX_KEY).then(result => {
                map.setCenter(result);
                map.setZoom(9);
                Map.updateMarker(result);
            });
        }
    };
    // Event object and methods
    const Event = {
        // sets up event listener for button click as well as enter input in search bar
        checkForSearch() {
            // checking for "enter" input
            $("#input-address").keyup((e) => {
                if (e.keyCode === 13) {
                    $("#address-btn").click();
                }
            });
            // checking for search button click
            $("#address-btn").click(() => {
                User.searchAddress($("#input-address").val());
                $("#input-address").val("");
            });
        },
        // sets up event listener for marker drag and updates marker on drag end
        checkForMarkerDrag() {
            marker.on("dragend", () => {
                Map.updateMarker([marker.getLngLat().lng, marker.getLngLat().lat]);
            });
        },
        // sets up event listener for click on a map and updates marker
        checkForMapClick() {
            map.on("click", (e) => {
                Map.updateMarker([e.lngLat.lng, e.lngLat.lat]);
            });
        }
    };

    // ------------ INITIALIZING AND EVENT LISTENERS ------------
    // Initialize Map
    Map.initialize();
    // Add Event Listeners
    Event.checkForSearch();
    Event.checkForMarkerDrag();
    Event.checkForMapClick();

});