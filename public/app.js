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
