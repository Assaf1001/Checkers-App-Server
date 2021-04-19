const socketio = require("socket.io");
const {
    initRedisDB,
    removeUserRedis,
    getUserRedis,
} = require("./redisRequests");
const { addUser, getUsers, generateRoom, getRoom } = require("./utils");

const serverIo = (httpServer) => {
    const io = socketio(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    initRedisDB()
        .then((res) => console.log(res))
        .catch((err) => console.log(err));

    io.on("connection", (socket) => {
        console.log("New WebSocket Connection");

        socket.on("addUser", (user) => {
            addUser(socket.id, user);

            getUsers().then((users) => {
                io.emit("getUsers", users);
                console.log(users);
            });
        });

        socket.on("disconnect", () => {
            removeUserRedis(socket.id)
                .then(() => {
                    return getUsers();
                })
                .then((users) => {
                    io.emit("getUsers", users);
                });
        });

        socket.on("sendInvitation", (id) => {
            getUserRedis(socket.id).then((user) => {
                socket.to(id).emit("receiveInvitation", user);
            });
        });

        socket.on("sendDecline", (id) => {
            getUserRedis(socket.id).then((user) => {
                socket.to(id).emit("receiveDecline", user);
                socket.emit("receiveDecline", user);
            });
        });

        socket.on("sendAcception", (id) => {
            generateRoom(id, socket.id)
                .then((room) => {
                    socket.to(id).emit("receiveAcception", room);
                    socket.emit("receiveAcception", room);

                    return getUsers();
                })
                .then((users) => {
                    io.emit("getUsers", users);
                });
        });

        socket.on("sendRoom", () => {
            const room = getRoom(socket.id);

            if (room) {
                let opponent;
                if (room.player1.id === socket.id) {
                    opponent = room.player2;
                } else {
                    opponent = room.player1;
                }
                socket.emit("receiveRoom", { room, opponent });
            }
        });

        socket.on("sendState", (state, opponentId) => {
            socket.to(opponentId).emit("receiveState", state);
        });
    });
};

module.exports = serverIo;
