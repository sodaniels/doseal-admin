const { Log } = require("../helpers/Log");
const { createClient } = require('redis');

const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

async function connect() {
    await client.connect();
}

connect();

async function getRedis(key) {
   return await client.get(key);
}


async function setRedis(key, value) {
   return await client.set(key, value);
}

async function setRedisWithExpiry(key, expiryInSeconds, value) {
    return await client.setEx(key, expiryInSeconds, value);
 }

async function removeRedis(key) {
    console.info('removing redis key');
    return await client.del(key);
}


module.exports = {
	setRedis,
	getRedis,
	removeRedis,
    setRedisWithExpiry,
};
