const express = require("express");
const cors = require("cors");
const http = require("http");
const ioConnection = require("./socket.io/socket.io.js");
const userRouter = require("./routers/userRouter.js");
require("./db/mongoose.js");

const port = process.env.PORT;

const app = express();
const httpServer = http.createServer(app);

app.use(express.json());
app.use(cors());
app.use(userRouter);

ioConnection(httpServer);

httpServer.listen(port, () => {
    console.log("Server is connected, Port:", port);
});
