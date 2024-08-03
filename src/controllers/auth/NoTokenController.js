const axios = require("axios");
const { Log } = require('../../helpers/Log');
const Location = require('../../models/location.model');

async function storeLocation(req, res) {
	const admin = req.session.user;

	try {
		const { lat, lng, address } = req.body;

		// Check if location already exists
		let location = await Location.findOne({ lat, lng, address, addedBy: admin._id });

		if (!location) {
			// Location does not exist, create a new one
			location = new Location({ lat, lng, address, addedBy: admin._id });
			await location.save();
		}

		// Respond with success message or other appropriate data
		res.status(200).json({ message: 'Location saved successfully', location });
	} catch (error) {
		// Handle any errors that occur during database operations
		console.error('Error saving location:', error);
		res.status(500).json({ error: 'Internal server error' });
	}



}



module.exports = {
	storeLocation
};
