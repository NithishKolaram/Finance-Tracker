document.getElementById('month').innerText = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

async function fetchUsers() {
    try {
        const response = await fetch('/api/login', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const users = await response.json();
        console.log('Fetched users:', users);
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

async function displayUsers() {
    const users = await fetchUsers();
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.textContent = `User: ${user.users}`;
        userList.appendChild(listItem);
    });
}

document.getElementById('refresh-btn').addEventListener('click', displayUsers);

window.onload = displayUsers;