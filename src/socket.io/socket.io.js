const socketio = require("socket.io");
const { addUser, getUsers, removeUser } = require("./utils");

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
            io.emit("getUsers", getUsers());
        });

        socket.on("disconnect", () => {
            removeUser(socket.id);
            io.emit("getUsers", getUsers());
        });
    });
};

module.exports = serverIo;
