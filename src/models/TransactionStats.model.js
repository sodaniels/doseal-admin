const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for global statistics
const TransactionStatsSchema = new Schema({
	totalAmount: { type: Number, default: 0 },
	totalFee: { type: Number, default: 0 },
	totalCommission: { type: Number, default: 0 },
	totalOnTotal: { type: Number, default: 0 },
});

// Register the model with Mongoose
const TransactionStats = mongoose.model(
	"TransactionStats",
	TransactionStatsSchema
);

// Function to update total expense in the relevant currency
const updateTransactionStats = async (transaction) => {
	try {
		// Find the updateTransactionStats document, or create it if it doesn't exist
		let transactionStats = await TransactionStats.findOne(); // Correct: Using findOne instead of find
		if (!transactionStats) {
			transactionStats = new TransactionStats();
		}

		// Update the relevant field based on the currency
		if (transaction.status === "Successful") {
			transactionStats.totalAmount += transaction.amount;
			transactionStats.totalFee += transaction.fee;
			transactionStats.totalCommission += transaction.Commission || 0;
			transactionStats.totalOnTotal += transaction.totalAmount;
		}

		// Save the updated document
		await transactionStats.save();
		console.log("TransactionStats updated successfully.");
	} catch (error) {
		console.error("Error updating TransactionStats:", error);
	}
};

module.exports = { TransactionStats, updateTransactionStats };
