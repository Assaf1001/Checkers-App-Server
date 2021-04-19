const { nanoid } = require("nanoid");
const {
    addUserRedis,
    getUsersRedis,
    getUserRedis,
    removeUserRedis,
} = require("./redisRequests");

let rooms = [];

const addUser = (id, user) => {
    delete user.email;

    addUserRedis({ id, ...user }).then((res) => console.log(res));
};

const getUsers = async () => {
    try {
        const users = await getUsersRedis();

        return users;
    } catch (err) {
        return err;
    }
};

const generateRoom = async (player1Id, player2Id) => {
    try {
        const player1 = await getUserRedis(player1Id);
        const player2 = await getUserRedis(player2Id);
        await removeUserRedis(player1Id);
        await removeUserRedis(player2Id);

        const room = {
            id: nanoid(),
            player1,
            player2,
        };
        rooms.push(room);

        return room;
    } catch (err) {
        console.log(err);
    }
};

const getRoom = (id) =>
    rooms.find((room) => room.player1.id === id || room.player2.id === id);

module.exports = {
    addUser,
    getUsers,
    generateRoom,
    getRoom,
};
