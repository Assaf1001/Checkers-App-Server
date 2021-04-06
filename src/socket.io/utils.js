const { nanoid } = require("nanoid");

let users = [];
let rooms = [];

const addUser = (id, user) => {
    for (let userObj of users) {
        if (userObj.userName === user.userName) return;
    }
    delete user.email;
    if (user) users.push({ id, ...user });
};

const removeUser = (id) => {
    users = users.filter((user) => user.id !== id);
};

const getUsers = () => users;

const getUser = (id) => users.find((user) => user.id === id);

const generateRoom = (player1, player2) => {
    removeUser(player1.id);
    removeUser(player2.id);

    const room = {
        id: nanoid(),
        player1,
        player2,
    };
    rooms.push(room);

    return room;
};

const getRoom = (id) =>
    rooms.find((room) => room.player1.id === id || room.player2.id === id);

const getRooms = () => rooms;

module.exports = {
    addUser,
    removeUser,
    getUsers,
    getUser,
    generateRoom,
    getRooms,
    getRoom,
};
