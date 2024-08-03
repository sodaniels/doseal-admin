function randId() {
	const min = 100000; // Minimum 6-digit number
	const max = 999999; // Maximum 6-digit number
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand8Id() {
	const min = 10000000; // Minimum 8-digit number
	const max = 99999999; // Maximum 8-digit number
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


function rand10Id() {
	const min = 1000000000; // Minimum 10-digit number
	const max = 9999999999; // Maximum 10-digit number
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
	randId, rand8Id, rand10Id
};
