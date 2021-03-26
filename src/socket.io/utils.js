let users = [];

const addUser = (id, userName) => {
    for (let user of users) {
        if (user.userName === userName) return;
    }
    if (userName) users.push({ id, userName });
};

const removeUser = (id) => {
    users = users.filter((user) => user.id !== id);
};

const getUsers = () => users;

module.exports = { addUser, removeUser, getUsers };
