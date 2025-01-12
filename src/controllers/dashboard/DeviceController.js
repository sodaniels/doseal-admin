const Device = require("../../models/device");
const { shortDate } = require("../../helpers/shortDate");
const Helpers = require("../../helpers/helper");
const helpers = new Helpers();


async function getDevices(req, res) {
	const page = req.query.page || 1;
	const perPage = 20;

	const devices = await Device.find()
		.sort({ createdAt: -1 })
		.skip((page - 1) * perPage)
		.limit(perPage)
		.lean();

	const totaldevices = await Device.countDocuments();

	res.render("backend/devices/manage", {
		pageTitle: "Devices",
		path: "/devices",
		devices: devices,
		shortDate: shortDate,
		totalPages: Math.ceil(totaldevices / perPage),
		currentPage: page,
		startDate: false,
		endDate: false,
		totaldevices: totaldevices,
	});
}

module.exports = {
	getDevices,
};
