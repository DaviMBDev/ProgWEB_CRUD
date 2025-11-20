document.addEventListener('DOMContentLoaded', () => {
    const continentsTbody = document.getElementById('continents-tbody');
    const addContinentForm = document.getElementById('add-continent-form');
    const editContinentForm = document.getElementById('edit-continent-form');

    const filterNameInput = document.getElementById('filter-name');
    const filterDescriptionInput = document.getElementById('filter-description');
    const filterButton = document.getElementById('filter-button');

    filterButton.addEventListener('click', () => {
        fetchContinents({
            name: filterNameInput.value,
            description: filterDescriptionInput.value,
        });
    });

    const continentNameInput = document.getElementById('continent-name');

    continentNameInput.addEventListener('blur', async () => {
        const continentName = continentNameInput.value;
        if(continentName){
            const response = await fetch(`https://restcountries.com/v3.1/region/${continentName}`);
            if(response.ok){
                document.getElementById('continent-description').value = "";
            }
        }
    });

    const fetchContinents = async (filters = {}) => {
        let url = '/continents?';
        for (const key in filters) {
            if (filters[key]) {
                url += `${key}=${filters[key]}&`;
            }
        }
        const response = await fetchWithAuth(url);
        const continents = await response.json();

        continentsTbody.innerHTML = '';

        continents.forEach(continent => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${continent.name}</td>
                <td>${continent.description}</td>
                <td>
                    <button class="edit-continent edit-button" data-id="${continent.id}">Edit</button>
                    <button class="delete-continent delete-button" data-id="${continent.id}">Delete</button>
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

    fetchContinents();
});
