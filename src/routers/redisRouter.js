const express = require("express");
const redisClient = require("../db/redis");

const router = new express.Router();

router.post("/init", async (req, res) => {
    try {
        await redisClient.flushallAsync();

        res.send("DB initialized");
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post("/add-user", async (req, res) => {
    try {
        const jsonUser = JSON.stringify(req.body.user);
        await redisClient.rpushAsync("users", jsonUser);

        res.send("OK");
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get("/get-users", async (req, res) => {
    try {
        const jsonUsers = await redisClient.lrangeAsync("users", 0, -1);

        const users = [];
        for (let jsonUser of jsonUsers) {
            users.push(JSON.parse(jsonUser));
        }

        res.send(users);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post("/get-user", async (req, res) => {
    try {
        const jsonUsers = await redisClient.lrangeAsync("users", 0, -1);

        const jsonUser = jsonUsers.find((user) => user.includes(req.body.id));

        res.send(JSON.parse(jsonUser));
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post("/remove-user", async (req, res) => {
    try {
        const jsonUsers = await redisClient.lrangeAsync("users", 0, -1);

        const users = jsonUsers.filter((user) => !user.includes(req.body.id));
        await redisClient.delAsync("users");
        if (users.length > 0) await redisClient.rpushAsync("users", users);

        res.send("User removed");
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;
