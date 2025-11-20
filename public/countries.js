document.addEventListener('DOMContentLoaded', () => {
    const countriesTbody = document.getElementById('countries-tbody');
    const addCountryForm = document.getElementById('add-country-form');
    const editCountryForm = document.getElementById('edit-country-form');
    const countryContinentSelect = document.getElementById('country-continent');
    const editCountryContinentSelect = document.getElementById('edit-country-continent');

    const filterNameInput = document.getElementById('filter-name');
    const filterPopulationInput = document.getElementById('filter-population');
    const filterOfficialLanguageInput = document.getElementById('filter-official-language');
    const filterCurrencyInput = document.getElementById('filter-currency');
    const filterButton = document.getElementById('filter-button');

    filterButton.addEventListener('click', () => {
        fetchCountries({
            name: filterNameInput.value,
            population: filterPopulationInput.value,
            official_language: filterOfficialLanguageInput.value,
            currency: filterCurrencyInput.value,
            continent_id: filterContinentSelect.value,
        });
    });

    const countryNameInput = document.getElementById('country-name');

    countryNameInput.addEventListener('blur', async () => {
        const countryName = countryNameInput.value;
        if (countryName) {
            let response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
            if (!response.ok) {
                response = await fetch(`https://restcountries.com/v3.1/translation/${countryName}`);
            }

            if (response.ok) {
                const data = await response.json();
                const countryData = data[0];
                document.getElementById('country-name').value = countryData.name.common;
                document.getElementById('country-population').value = countryData.population;
                document.getElementById('country-official-language').value = Object.values(countryData.languages)[0];
                document.getElementById('country-currency').value = Object.values(countryData.currencies)[0].name;

                const continentName = countryData.continents[0];
                const continentResponse = await fetchWithAuth(`/continents/name/${continentName}`);
                if (continentResponse.ok) {
                    const continent = await continentResponse.json();
                    countryContinentSelect.value = continent.id;
                }
            }
        }
    });

    const fetchCountries = async (filters = {}) => {
        let url = '/countries?';
        for (const key in filters) {
            if (filters[key]) {
                url += `${key}=${filters[key]}&`;
            }
        }
        const response = await fetchWithAuth(url);
        const countries = await response.json();

        countriesTbody.innerHTML = '';

        for (const country of countries) {
            const continentResponse = await fetchWithAuth(`/continents/${country.continent_id}`);
            const continent = await continentResponse.json();

            const restCountriesResponse = await fetch(`https://restcountries.com/v3.1/name/${country.name}`);
            const restCountriesData = await restCountriesResponse.json();
            const flagUrl = restCountriesData[0]?.flags?.svg;
            const currencySymbol = Object.values(restCountriesData[0].currencies)[0].symbol;

            const row = document.createElement('tr');

            row.innerHTML = `
                <td><img src="${flagUrl}" alt="Bandeira de ${country.name}" width="50"></td>
                <td>${country.name}</td>
                <td>${country.population.toLocaleString('pt-BR')}</td>
                <td>${country.official_language}</td>
                <td>${currencySymbol} ${country.currency}</td>
                <td>${continent.name}</td>
                <td>
                    <button class="edit-country edit-button" data-id="${country.id}">Edit</button>
                    <button class="delete-country delete-button" data-id="${country.id}">Delete</button>
                </td>
            `;

            countriesTbody.appendChild(row);
        }
    };

    addCountryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('country-name').value;
        const population = parseInt(document.getElementById('country-population').value);
        const official_language = document.getElementById('country-official-language').value;
        const currency = document.getElementById('country-currency').value;

        // Get continent from restcountries
        let countryResponse = await fetch(`https://restcountries.com/v3.1/name/${name}`);
        if (!countryResponse.ok) {
            countryResponse = await fetch(`https://restcountries.com/v3.1/translation/${name}`);
        }

        if (!countryResponse.ok) {
            alert('País não encontrado na API restcountries');
            return;
        }
        const countryData = await countryResponse.json();
        const continentName = countryData[0].continents[0];

        // Check if continent exists
        let continentResponse = await fetchWithAuth(`/continents/name/${continentName}`);
        let continent;

        if (continentResponse.status === 404) {
            // Continent does not exist, create it
            const wikipediaResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${continentName}`);
            let continentDescription = '';
            if (wikipediaResponse.ok) {
                const wikipediaData = await wikipediaResponse.json();
                continentDescription = wikipediaData.extract;
            }

            const createContinentResponse = await fetchWithAuth('/continents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: continentName, description: continentDescription }),
            });
            continent = await createContinentResponse.json();
            await populateContinentDropdown();
        } else {
            continent = await continentResponse.json();
        }

        const continent_id = continent.id;

        await fetchWithAuth('/countries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, population, official_language, currency, continent_id }),
        });

        addCountryForm.reset();
        fetchCountries();
    });

    editCountryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-country-id').value;
        const name = document.getElementById('edit-country-name').value;
        const population = parseInt(document.getElementById('edit-country-population').value);
        const official_language = document.getElementById('edit-country-official-language').value;
        const currency = document.getElementById('edit-country-currency').value;
        const continent_id = parseInt(editCountryContinentSelect.value);

        await fetchWithAuth(`/countries/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, population, official_language, currency, continent_id }),
        });

        closeModal('edit-country-modal');
        fetchCountries();
    });

    countriesTbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-country')) {
            const id = e.target.dataset.id;
            await fetchWithAuth(`/countries/${id}`, { method: 'DELETE' });
            fetchCountries();
        }

        if (e.target.classList.contains('edit-country')) {
            const id = e.target.dataset.id;
            const response = await fetchWithAuth(`/countries/${id}`);
            const country = await response.json();

            document.getElementById('edit-country-id').value = country.id;
            document.getElementById('edit-country-name').value = country.name;
            document.getElementById('edit-country-population').value = country.population;
            document.getElementById('edit-country-official-language').value = country.official_language;
            document.getElementById('edit-country-currency').value = country.currency;
            editCountryContinentSelect.value = country.continent_id;

            openModal('edit-country-modal');
        }
    });

    const populateContinentDropdown = async () => {
        const response = await fetchWithAuth('/continents');
        const continents = await response.json();

        countryContinentSelect.innerHTML = '';
        editCountryContinentSelect.innerHTML = '';

        continents.forEach(continent => {
            const option = document.createElement('option');
            option.value = continent.id;
            option.textContent = continent.name;
            countryContinentSelect.appendChild(option);
            editCountryContinentSelect.appendChild(option.cloneNode(true));
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

    fetchCountries();
    populateContinentDropdown();
    populateContinentFilterDropdown();
});
