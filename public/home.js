document.addEventListener('DOMContentLoaded', () => {
    const filterContinentSelect = document.getElementById('filter-continent');
    const filterCountrySelect = document.getElementById('filter-country');
    const filterCityInput = document.getElementById('filter-city');
    const filterPopulationInput = document.getElementById('filter-population');
    const filterCurrencyInput = document.getElementById('filter-currency');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('results-container');

    const populateContinentDropdown = async () => {
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

    const populateCountryDropdown = async (continentId) => {
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

    filterContinentSelect.addEventListener('change', () => {
        populateCountryDropdown(filterContinentSelect.value);
    });

    searchButton.addEventListener('click', async () => {
        const continentId = filterContinentSelect.value;
        const countryId = filterCountrySelect.value;
        const cityName = filterCityInput.value;
        const population = filterPopulationInput.value;
        const currency = filterCurrencyInput.value;

        let url = '/cities?';
        if (continentId) {
            url += `continentId=${continentId}&`;
        }
        if (countryId) {
            url += `countryId=${countryId}&`;
        }
        if (cityName) {
            url += `name=${cityName}&`;
        }
        if (population) {
            url += `population=${population}&`;
        }
        if (currency) {
            url += `currency=${currency}&`;
        }

        const response = await fetchWithAuth(url);
        const cities = await response.json();

        resultsContainer.innerHTML = '';
        if (cities.length === 0) {
            resultsContainer.innerHTML = '<p>Nenhuma cidade encontrada.</p>';
            return;
        }

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>População</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>País</th>
                    <th>Clima</th>
                </tr>
            </thead>
            <tbody id="results-tbody"></tbody>
        `;
        resultsContainer.appendChild(table);

        const resultsTbody = document.getElementById('results-tbody');
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
            `;
            resultsTbody.appendChild(row);
        }
    });

    populateContinentDropdown();
    populateCountryDropdown();
});
