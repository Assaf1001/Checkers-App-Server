const Axios = require("axios");

const redisDB = "http://localhost:2000/";

const initRedisDB = async () => {
    try {
        const res = await Axios.post(`${redisDB}init`);

        return res.data;
    } catch (err) {
        throw new Error(err.response.data);
    }
};

const addUserRedis = async (user) => {
    try {
        const res = await Axios.post(`${redisDB}add-user`, {
            user,
        });

        return res.data;
    } catch (err) {
        throw new Error(err.response.data);
    }
};

const getUsersRedis = async () => {
    try {
        const res = await Axios.get(`${redisDB}get-users`);

        return res.data;
    } catch (err) {
        throw new Error(err.response.data);
    }
};

const getUserRedis = async (id) => {
    try {
        const res = await Axios.post(`${redisDB}get-user`, { id });

        return res.data;
    } catch (err) {
        throw new Error(err.response.data);
    }
};

const removeUserRedis = async (id) => {
    try {
        const res = await Axios.post(`${redisDB}remove-user`, { id });

        return res.data;
    } catch (err) {
        throw new Error(err.response.data);
    }
};

module.exports = {
    addUserRedis,
    getUsersRedis,
    getUserRedis,
    initRedisDB,
    removeUserRedis,
};
