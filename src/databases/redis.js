const { Log } = require("../helpers/Log");
const { createClient } = require("redis");

const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

async function connect() {
	try {
		await client.connect();
		Log.info("Redis Client Connected");
	} catch (error) {
		Log.error("Error connecting Redis Client");
	}
}

connect();

async function getRedis(key) {
	Log.info("Getting Redis key " + key);
	return await client.get(key);
}

async function setRedis(key, value) {
	Log.info("Setting redis key " + key);
	await client.set(key, value);
	await client.expire(key, 300);
}

async function removeRedis(key) {
	console.info("removing redis key");
	return await client.del(key);
}

async function setRedisExpiresOneMinute(key, value) {
	Log.info("Setting redis key " + key);
	await client.set(key, value);
	await client.expire(key, 60);
}

module.exports = {
	setRedis,
	getRedis,
	setRedisExpiresOneMinute,
	removeRedis,
};
