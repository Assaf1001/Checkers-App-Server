const socketio = require("socket.io");
const { base } = require("../models/userModel");
const {
    addUser,
    getUsers,
    removeUser,
    getUser,
    generateRoom,
    getRooms,
    getRoom,
} = require("./utils");

const serverIo = (httpServer) => {
    const io = socketio(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            // methods: ["GET", "POST"],
            // allowedHeaders: ["userName"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("New WebSocket Connection");

        socket.on("addUser", (userName) => {
            addUser(socket.id, userName);
            io.emit("getUsers", getUsers(socket.id));
        });

        socket.on("disconnect", () => {
            removeUser(socket.id);
            io.emit("getUsers", getUsers(socket.id));
        });

        socket.on("sendInvitation", (id) => {
            socket.to(id).emit("receiveInvitation", getUser(socket.id));
        });

        socket.on("sendDecline", (id) => {
            socket.to(id).emit("receiveDecline", getUser(socket.id));
            socket.emit("receiveDecline", getUser(socket.id));
        });

        socket.on("sendAcception", (id) => {
            const room = generateRoom(getUser(id), getUser(socket.id));
            socket.to(id).emit("receiveAcception", room);
            socket.emit("receiveAcception", room);
        });

        socket.on("getRooms", () => {
            socket.emit("receiveRooms", getRooms());
        });

        socket.on("sendRoom", () => {
            const room = getRoom(socket.id);
            // if (!room.player1) {
            //     socket.emit("receiveRoom");
            // }
            let opponent;
            if (room.player1.id === socket.id) {
                opponent = room.player2;
            } else {
                opponent = room.player1;
            }
            socket.emit("receiveRoom", { room, opponent });
        });

        socket.on("sendBoard", (board, oppponentId) => {
            // console.log(board);
            socket.to(oppponentId).emit("receiveBoard", board);
        });
    });
};

module.exports = serverIo;
