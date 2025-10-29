document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
  }

  const logoutButton = document.getElementById('logout-button');

  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  });

  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      window.location.href = '/login.html';
    }
    return response;
  };

  // Modal handling
  const openModal = (modalId) => {
    document.getElementById(modalId).style.display = 'block';
  };

  const closeModal = (modalId) => {
    document.getElementById(modalId).style.display = 'none';
  };

  document.querySelectorAll('.modal .close').forEach(closeButton => {
    closeButton.addEventListener('click', (e) => {
      const modalId = e.target.closest('.modal').id;
      closeModal(modalId);
    });
  });

  // Continents
  const continentsTbody = document.getElementById('continents-tbody');
  const addContinentForm = document.getElementById('add-continent-form');
  const editContinentForm = document.getElementById('edit-continent-form');

  const fetchContinents = async () => {
    const response = await fetchWithAuth('/continents');
    const continents = await response.json();

    continentsTbody.innerHTML = '';

    continents.forEach(continent => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${continent.name}</td>
        <td>${continent.description}</td>
        <td>
          <button class="edit-continent" data-id="${continent.id}">Edit</button>
          <button class="delete-continent" data-id="${continent.id}">Delete</button>
        </td>
      `;

      continentsTbody.appendChild(row);
    });
  };

  addContinentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('continent-name').value;
    const description = document.getElementById('continent-description').value;

    await fetchWithAuth('/continents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });

    addContinentForm.reset();
    fetchContinents();
  });

  editContinentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-continent-id').value;
    const name = document.getElementById('edit-continent-name').value;
    const description = document.getElementById('edit-continent-description').value;

    await fetchWithAuth(`/continents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });

    closeModal('edit-continent-modal');
    fetchContinents();
  });

  continentsTbody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-continent')) {
      const id = e.target.dataset.id;
      await fetchWithAuth(`/continents/${id}`, { method: 'DELETE' });
      fetchContinents();
    }

    if (e.target.classList.contains('edit-continent')) {
      const id = e.target.dataset.id;
      const response = await fetchWithAuth(`/continents/${id}`);
      const continent = await response.json();

      document.getElementById('edit-continent-id').value = continent.id;
      document.getElementById('edit-continent-name').value = continent.name;
      document.getElementById('edit-continent-description').value = continent.description;

      openModal('edit-continent-modal');
    }
  });

  // Countries
  const countriesTbody = document.getElementById('countries-tbody');
  const addCountryForm = document.getElementById('add-country-form');
  const editCountryForm = document.getElementById('edit-country-form');
  const countryContinentSelect = document.getElementById('country-continent');
  const editCountryContinentSelect = document.getElementById('edit-country-continent');

  const fetchCountries = async () => {
    const response = await fetchWithAuth('/countries');
    const countries = await response.json();

    countriesTbody.innerHTML = '';

    for (const country of countries) {
      const continentResponse = await fetchWithAuth(`/continents/${country.continent_id}`);
      const continent = await continentResponse.json();

      const restCountriesResponse = await fetch(`https://restcountries.com/v3.1/name/${country.name}`);
      const restCountriesData = await restCountriesResponse.json();
      const flagUrl = restCountriesData[0]?.flags?.svg;

      const row = document.createElement('tr');

      row.innerHTML = `
        <td><img src="${flagUrl}" alt="Flag of ${country.name}" width="50"></td>
        <td>${country.name}</td>
        <td>${country.population}</td>
        <td>${country.official_language}</td>
        <td>${country.currency}</td>
        <td>${continent.name}</td>
        <td>
          <button class="edit-country" data-id="${country.id}">Edit</button>
          <button class="delete-country" data-id="${country.id}">Delete</button>
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
    const continent_id = parseInt(countryContinentSelect.value);

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

  // Cities
  const citiesTbody = document.getElementById('cities-tbody');
  const addCityForm = document.getElementById('add-city-form');
  const editCityForm = document.getElementById('edit-city-form');
  const cityCountrySelect = document.getElementById('city-country');
  const editCityCountrySelect = document.getElementById('edit-city-country');

  const fetchCities = async () => {
    const response = await fetchWithAuth('/cities');
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
        <td>${city.population}</td>
        <td>${city.latitude}</td>
        <td>${city.longitude}</td>
        <td>${country.name}</td>
        <td>${weather}</td>
        <td>
          <button class="edit-city" data-id="${city.id}">Edit</button>
          <button class="delete-city" data-id="${city.id}">Delete</button>
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

  // Populate dropdowns
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

  const populateCountryDropdown = async () => {
    const response = await fetchWithAuth('/countries');
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

  // Map
  const svg = d3.select('#map');
  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;

  const projection = d3.geoMercator().fitSize([width, height], { type: 'Sphere' });
  const path = d3.geoPath().projection(projection);

  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  const g = svg.append('g');

  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(data => {
    const countries = topojson.feature(data, data.objects.countries);

    g.selectAll('path')
      .data(countries.features)
      .enter().append('path')
      .attr('class', 'country')
      .attr('d', path)
      .on('click', async (event, d) => {
        const countryName = d.properties.name;
        const response = await fetchWithAuth(`/countries/byName/${countryName}`);

        if (response.ok) {
          const country = await response.json();
          document.getElementById('edit-country-id').value = country.id;
          document.getElementById('edit-country-name').value = country.name;
          document.getElementById('edit-country-population').value = country.population;
          document.getElementById('edit-country-official-language').value = country.official_language;
          document.getElementById('edit-country-currency').value = country.currency;
          editCountryContinentSelect.value = country.continent_id;
          openModal('edit-country-modal');
        } else {
          document.getElementById('country-name').value = countryName;
          openModal('add-country-modal');
        }
      });
  });

  svg.call(zoom);

  // Initial data fetch
  fetchContinents();
  fetchCountries();
  fetchCities();
  populateContinentDropdown();
  populateCountryDropdown();
});