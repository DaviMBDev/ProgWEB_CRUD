document.addEventListener('DOMContentLoaded', () => {
    const citiesTbody = document.getElementById('cities-tbody');
    const addCityForm = document.getElementById('add-city-form');
    const editCityForm = document.getElementById('edit-city-form');
    const cityCountrySelect = document.getElementById('city-country');
    const editCityCountrySelect = document.getElementById('edit-city-country');

    const cityContinentSelect = document.getElementById('city-continent');
    const editCityContinentSelect = document.getElementById('edit-city-continent');

    cityContinentSelect.addEventListener('change', () => {
        populateCountryDropdown(cityContinentSelect.value);
    });

    editCityContinentSelect.addEventListener('change', () => {
        populateCountryDropdown(editCityContinentSelect.value);
    });

    const filterNameInput = document.getElementById('filter-name');
    const filterPopulationInput = document.getElementById('filter-population');
    const filterButton = document.getElementById('filter-button');

    filterButton.addEventListener('click', () => {
        fetchCities({
            name: filterNameInput.value,
            population: filterPopulationInput.value,
            countryId: filterCountrySelect.value,
            continentId: filterContinentSelect.value,
        });
    });

    const cityNameInput = document.getElementById('city-name');

    cityNameInput.addEventListener('blur', async () => {
        const cityName = cityNameInput.value;
        if (cityName) {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${cityName}&format=json&limit=1`);
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    const cityData = data[0];
                    document.getElementById('city-latitude').value = cityData.lat;
                    document.getElementById('city-longitude').value = cityData.lon;

                    const countryCode = cityData.address.country_code.toUpperCase();
                    const countryResponse = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
                    if (countryResponse.ok) {
                        const countryData = await countryResponse.json();
                        const countryName = countryData[0].name.common;
                        
                        if (countryData[0].capital && countryData[0].capital.length > 0 && countryData[0].capital[0].toLowerCase() === cityName.toLowerCase()) {
                            document.getElementById('city-population').value = countryData[0].population;
                        } else {
                            document.getElementById('city-population').value = '';
                        }
                        
                        const countryResponseDb = await fetchWithAuth(`/countries/name/${countryName}`);
                        if (countryResponseDb.ok) {
                            const country = await countryResponseDb.json();
                            cityCountrySelect.value = country.id;
                        }
                    }
                }
            }
        }
    });

    const fetchCities = async (filters = {}) => {
        let url = '/cities?';
        for (const key in filters) {
            if (filters[key]) {
                url += `${key}=${filters[key]}&`;
            }
        }
        const response = await fetchWithAuth(url);
        const cities = await response.json();

        citiesTbody.innerHTML = '';

        for (const city of cities) {
            const countryResponse = await fetchWithAuth(`/countries/${city.country_id}`);
            const country = await countryResponse.json();

            // TODO: Replace with a valid OpenWeatherMap API key
            const apiKey = 'YOUR_API_KEY';
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.latitude}&lon=${city.longitude}&appid=${apiKey}`);
            const weatherData = await weatherResponse.json();
            const weather = weatherData.weather ? weatherData.weather[0].description : 'N/A';

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${city.name}</td>
                <td>${city.population.toLocaleString('pt-BR')}</td>
                <td>${city.latitude.toLocaleString('pt-BR')}</td>
                <td>${city.longitude.toLocaleString('pt-BR')}</td>
                <td>${country.name}</td>
                <td>${weather}</td>
                <td>
                    <button class="edit-city edit-button" data-id="${city.id}">Edit</button>
                    <button class="delete-city delete-button" data-id="${city.id}">Delete</button>
                </td>
            `;

            citiesTbody.appendChild(row);
        }
    };

    addCityForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('city-name').value;
        const population = parseInt(document.getElementById('city-population').value);
        const latitude = parseFloat(document.getElementById('city-latitude').value);
        const longitude = parseFloat(document.getElementById('city-longitude').value);
        const country_id = parseInt(cityCountrySelect.value);

        await fetchWithAuth('/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, population, latitude, longitude, country_id }),
        });

        addCityForm.reset();
        fetchCities();
    });

    editCityForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-city-id').value;
        const name = document.getElementById('edit-city-name').value;
        const population = parseInt(document.getElementById('edit-city-population').value);
        const latitude = parseFloat(document.getElementById('edit-city-latitude').value);
        const longitude = parseFloat(document.getElementById('edit-city-longitude').value);
        const country_id = parseInt(editCityCountrySelect.value);

        await fetchWithAuth(`/cities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, population, latitude, longitude, country_id }),
        });

        closeModal('edit-city-modal');
        fetchCities();
    });

    citiesTbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-city')) {
            const id = e.target.dataset.id;
            await fetchWithAuth(`/cities/${id}`, { method: 'DELETE' });
            fetchCities();
        }

        if (e.target.classList.contains('edit-city')) {
            const id = e.target.dataset.id;
            const response = await fetchWithAuth(`/cities/${id}`);
            const city = await response.json();

            document.getElementById('edit-city-id').value = city.id;
            document.getElementById('edit-city-name').value = city.name;
            document.getElementById('edit-city-population').value = city.population;
            document.getElementById('edit-city-latitude').value = city.latitude;
            document.getElementById('edit-city-longitude').value = city.longitude;
            editCityCountrySelect.value = city.country_id;

            openModal('edit-city-modal');
        }
    });

    const populateContinentDropdown = async () => {
        const response = await fetchWithAuth('/continents');
        const continents = await response.json();

        const cityContinentSelect = document.getElementById('city-continent');
        const editCityContinentSelect = document.getElementById('edit-city-continent');

        cityContinentSelect.innerHTML = '';
        editCityContinentSelect.innerHTML = '';

        continents.forEach(continent => {
            const option = document.createElement('option');
            option.value = continent.id;
            option.textContent = continent.name;
            cityContinentSelect.appendChild(option);
            editCityContinentSelect.appendChild(option.cloneNode(true));
        });
    };

    const populateCountryDropdown = async (continentId) => {
        const url = continentId ? `/countries/byContinent/${continentId}` : '/countries';
        const response = await fetchWithAuth(url);
        const countries = await response.json();

        cityCountrySelect.innerHTML = '';
        editCityCountrySelect.innerHTML = '';

        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.id;
            option.textContent = country.name;
            cityCountrySelect.appendChild(option);
            editCityCountrySelect.appendChild(option.cloneNode(true));
        });
    };

    const populateContinentFilterDropdown = async () => {
        const response = await fetchWithAuth('/continents');
        const continents = await response.json();

        filterContinentSelect.innerHTML = '<option value="">Selecione um continente</option>';
        continents.forEach(continent => {
            const option = document.createElement('option');
            option.value = continent.id;
            option.textContent = continent.name;
            filterContinentSelect.appendChild(option);
        });
    };

    const populateCountryFilterDropdown = async (continentId) => {
        const url = continentId ? `/countries/byContinent/${continentId}` : '/countries';
        const response = await fetchWithAuth(url);
        const countries = await response.json();

        filterCountrySelect.innerHTML = '<option value="">Selecione um país</option>';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.id;
            option.textContent = country.name;
            filterCountrySelect.appendChild(option);
        });
    };

    fetchCities();
    populateContinentDropdown();
    populateCountryDropdown();
    populateContinentFilterDropdown();
    populateCountryFilterDropdown();
});
