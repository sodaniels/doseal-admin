const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for global statistics
const globalStatsSchema = new Schema({
	totalExpenseInGHS: { type: Number, default: 0 },
	totalExpenseInUSD: { type: Number, default: 0 },
	totalExpenseInGBP: { type: Number, default: 0 },
});

// Register the model with Mongoose
const GlobalStats = mongoose.model("GlobalStats", globalStatsSchema);

// Function to update total expense in the relevant currency
const updateGlobalStats = async (newExpenseAmount, currency) => {
	try {
		// Find the GlobalStats document, or create it if it doesn't exist
		let globalStats = await GlobalStats.findOne(); // Correct: Using findOne instead of find
		if (!globalStats) {
			globalStats = new GlobalStats();
		}

		// Update the relevant field based on the currency
		if (currency === "GHS") {
			globalStats.totalExpenseInGHS += newExpenseAmount;
		} else if (currency === "USD") {
			globalStats.totalExpenseInUSD += newExpenseAmount;
		} else if (currency === "GBP") {
			globalStats.totalExpenseInGBP += newExpenseAmount;
		}

		// Save the updated document
		await globalStats.save();
		console.log("GlobalStats updated successfully.");
	} catch (error) {
		console.error("Error updating GlobalStats:", error);
	}
};

module.exports = { GlobalStats, updateGlobalStats };
