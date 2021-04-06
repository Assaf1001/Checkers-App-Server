const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const auth = require("../middleware/auth");

const router = new express.Router();

//// Login & Logout ////

// SignUp
router.post("/users/signup", async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch (err) {
        const message =
            (err.errors.userName
                ? `The User name "${err.errors.userName.value}"`
                : `The Email "${err.errors.email.value}"`) +
            " is already in use!";
        res.status(400).send({
            status: 400,
            message,
        });
    }
});

// LogIn
router.post("/users/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();

        res.send({ user, token });
    } catch (err) {
        res.status(400).send("Unable to login!");
    }
});

// LogOut
router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(
            (token) => token.token !== req.token
        );
        await req.user.save();

        res.send("Logout successfully");
    } catch (err) {
        res.status(500).send();
    }
});

// LogOut from all devices
router.post("/users/logoutAll/", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send("Logout from all devices successfully");
    } catch (err) {
        res.status(500).send();
    }
});

// Delete User
router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user.email);
    } catch (err) {
        res.send.status(500);
    }
});

// Edit details
router.patch("/users/me", auth, async (req, res) => {
    const _id = req.user._id;
    const update = req.body.update;

    try {
        const user = await User.findOneAndUpdate({ _id }, update, {
            runValidators: true,
            returnOriginal: false,
        });

        res.send({ user, token: req.token });
    } catch (err) {
        if (err.keyValue) {
            let key = Object.keys(err.keyValue)[0];
            key = key.includes(".") ? key.split(".")[1] : key;
            const value = err.keyValue[key];

            return res.status(400).send({
                status: 400,
                message: `The ${key} ${value} is already in use`,
            });
        }
        res.status(500).send(err);
    }
});

// Change Password
router.patch("/users/me/changePassword", auth, async (req, res) => {
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    const repeatedNewPassword = req.body.repeatedNewPassword;

    try {
        const isMatch = await bcrypt.compare(password, req.user.password);

        if (newPassword.length === 0 || repeatedNewPassword.length === 0) {
            return res
                .status(400)
                .send({ status: 400, message: "Please enter new password" });
        }

        if (!isMatch) {
            return res
                .status(400)
                .send({ status: 400, message: "Wrong Password" });
        }

        if (newPassword === password) {
            return res.status(400).send({
                status: 400,
                message:
                    "new password cannot be the same like current password",
            });
        }

        if (newPassword !== repeatedNewPassword) {
            return res.status(400).send({
                status: 400,
                message: "Two passwords must be identical",
            });
        }

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        const isLegalPassword = passwordRegex.test(newPassword);

        if (!isLegalPassword) {
            return res.status(400).send({
                status: 400,
                message:
                    "Password must contain capital character, regular character, a number and must have at least 8 characters",
            });
        }

        req.user.password = newPassword;
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

router.patch("/users/me/updateRank", auth, async (req, res) => {
    try {
        req.user.rank += req.body.rankToAdd;
        await req.user.save();

        res.send(req.user);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.patch("/users/me/updateLevel", auth, async (req, res) => {
    try {
        req.user.level = req.body.newLevel;
        await req.user.save();

        res.send(req.user);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get("/leaderBoard", async (req, res) => {
    try {
        const users = await User.find({});

        const leaderBoard = [];
        users.forEach((user) => {
            leaderBoard.push({
                userName: user.userName,
                rank: user.rank,
                level: user.level,
            });
        });

        res.send(leaderBoard);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;
