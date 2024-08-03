const axios = require("axios");

const Country = require("../../Models/country");
const { Log } = require("../../Helpers/Log");
const { format } = require("date-fns");

const beneficiaryData = require("../../SoftwareGroup/internal/beneficiary-data");

async function getCountries(req, res, next) {
	try {
		Log.info("[countries.js][getCountries]..getting countries");

		const countries = await Country.find({}).select(
			"name iso_3166_3 iso_3166_2 currencies flag mnos"
		);
		Log.info("[countries.js][getCountries]..got countries", countries);
		res.json(countries);
	} catch (err) {
		Log.error("[countries.js][getCountries]..error getting countries", err);
		res.status(500).json({ error: "Error getting countries" });
	}
}

async function getRates(req, res) {
	try {
		Log.info("[countries.js][getRates].. making request to rates api");

		const date = format(new Date(), "yyyy-MM-dd");
		from_currency = req.query.from_currency.toLowerCase();
		to_currency = req.query.to_currency.toLowerCase();

		const response = await axios.get(
			`https://rates.myzeepay.com/api/rates/7/${from_currency}/${to_currency}/${date}`
		);

		const rates = response.data;
		Log.info(`[countries.js][getRates][${date}]...\t` + JSON.stringify(rates));
		res.json(rates);
	} catch (err) {
		Log.error("[countries.js][getRates]..error getting rates", err);
		res.status(500).json({ error: "Error getting rates" });
	}
}

async function postBeneficiaryData (req, res) {
	const response = await beneficiaryData.execute(req);
	return res.json(response);
}

module.exports = {
	getCountries,
	getRates,
	postBeneficiaryData,
};
