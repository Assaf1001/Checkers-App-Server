const socketio = require("socket.io");
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

        socket.on("addUser", (user) => {
            addUser(socket.id, user);
            io.emit("getUsers", getUsers());
        });

        socket.on("disconnect", () => {
            removeUser(socket.id);
            io.emit("getUsers", getUsers());
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
            io.emit("getUsers", getUsers());
        });

        // socket.on("getRooms", () => {
        //     socket.emit("receiveRooms", getRooms());
        // });

        socket.on("sendRoom", () => {
            const room = getRoom(socket.id);
            console.log(getRooms());

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

        // socket.on('playAgain',(opponentId)=>{
        //     socket.emit('send')
        // })

        // socket.on("connectionCheck", (opponentId) => {
        // console.log(getRoom(socket.id));
        // console.log(socket.connected, io.sockets.sockets);
        // console.log(opponentId);
        // if (io.sockets.sockets[opponentId] != undefined) {
        // console.log(Object.keys(io.sockets.sockets));
        // } else {
        // console.log("Socket not connected");
        // }
        // });
    });
};

module.exports = serverIo;
