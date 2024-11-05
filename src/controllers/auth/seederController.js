require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const ApiUser = require("../../models/apiUser");

const clientId = crypto.randomBytes(16).toString("hex");
const clientSecret = crypto.randomBytes(64).toString("hex");

// Define apiUserArray with clientSecret already hashed
const apiUserArray = [
	{
		clientId: clientId,
		clientSecret: clientSecret, // will be hashed below
		redirectUri: "http://localhost:10000/login/redirect",
		contact_person_firstname: "John",
		contact_person_lastname: "Doe",
		contact_person_phone_number: "0244139937",
		company: "Doseal Limited",
		role_id: 5,
		streetname: "Accra Hight Street",
		city: "Accra",
		country: "Accra",
		state: "Ghana",
		postcode: "Lu4 0RG",
		country_code: "+44",
		user_currency: "GBP",
		total_funds: 0,
		total_payout: 0,
		total_available: 0,
		active: true,
	},
	
];

async function seedApiUserData() {
	console.log(clientSecret);
	try {
		// Hash the clientSecret for each user in apiUserArray
		const salt = await bcrypt.genSalt(10);
		const hashedClientSecret = await bcrypt.hash(clientSecret, salt);

		// Map over apiUserArray and assign the hashed clientSecret
		const apiUser = apiUserArray.map((user) => ({
			...user,
			clientSecret: hashedClientSecret,
		}));

		return apiUser;
	} catch (error) {
		console.log(error);
	}
}

exports.seeder = async (req, res) => {
	try {
		const seedApiUser = await seedApiUserData();

		// Clear existing data and insert new data
		await ApiUser.deleteMany({});
		await ApiUser.insertMany(seedApiUser);

		return res.status(200).json({
			success: true,
			code: 200,
			message: "Seeder Generated Successfully",
		});
	} catch (error) {
		console.error("Error in seeder:", error);
		return res
			.status(500)
			.json({ success: false, error: "Internal server error" });
	}
};
