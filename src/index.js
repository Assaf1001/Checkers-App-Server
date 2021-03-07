const express = require("express");
const cors = require("cors");
const userRouter = require("./routers/userRouter.js");
require("./db/mongoose.js");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use(userRouter);

app.listen(port, () => {
    console.log("Server is connected, Port:", port);
});
