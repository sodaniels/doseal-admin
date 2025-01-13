const Device = require("../../models/device");
const { shortDate } = require("../../helpers/shortDate");
const Helpers = require("../../helpers/helper");
const Download = require("../../models/device");
const downloadCSVHelper = require("../../helpers/downloadCSV");
const moment = require("moment");

async function getDevices(req, res) {
	const page = req.query.page || 1;
	const perPage = 20;

	const admin = req.session.admin;

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
		admin: admin,
		totaldevices: totaldevices,
	});
}

async function getDownloadsPage(req, res) {
	const page = req.query.page || 1;
	const perPage = 20;

	const admin = req.session.admin;

	const now = moment();

	try {
		const downloads = await Download.find()
			.sort({ createdAt: -1 })
			.skip((page - 1) * perPage)
			.limit(perPage)
			.lean();

		const allDownloads = await Download.find().lean();

		const totalDownloads = await Download.countDocuments();

		const iosDownloads = await Download.find({ Manufacturer: "Apple" });
		const totalIosDownloads = iosDownloads.length;

		const androidDownloads = await Download.find({ Manufacturer: "Google" });
		const totalAndroidDownloads = androidDownloads.length;

		const dailyDownloads = allDownloads.filter((download) =>
			moment(download.createdAt).isSame(now, "day")
		).length;

		const weeklyDownloads = allDownloads.filter((download) =>
			moment(download.createdAt).isSame(now, "week")
		).length;

		const monthlyDownloads = allDownloads.filter((download) =>
			moment(download.createdAt).isSame(now, "month")
		).length;

		const yearlyDownloads = allDownloads.filter((download) =>
			moment(download.createdAt).isSame(now, "year")
		).length;

		return res.status(200).render("backend/download/history", {
			pageTitle: "Downloads | Dashboard",
			path: "/downloads",
			errors: false,
			errorMessage: false,
			successMessage: false,
			csrfToken: req.csrfToken(),
			admin: admin,
			downloads: downloads,
			shortDate: shortDate,
			totalPages: Math.ceil(totalDownloads / perPage),
			currentPage: page,
			totalDownloads: totalDownloads,
			totalIosDownloads: totalIosDownloads,
			totalAndroidDownloads: totalAndroidDownloads,
			dailyDownloads: dailyDownloads,
			weeklyDownloads: weeklyDownloads,
			monthlyDownloads: monthlyDownloads,
			yearlyDownloads: yearlyDownloads,
			startDate: false,
			endDate: false,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).render("error", {
			pageTitle: "Error | ZeeMoney Dashboard",
			path: "/error",
			errors: false,
			csrfToken: req.csrfToken(),
			admin: admin,
			errorMessage: "Internal Server Error",
			downloads: false,
			totalPages: false,
			currentPage: false,
			totalDownloads: false,
		});
	}
}

async function filterDownloads(req, res) {
	const page = req.query.page || 1; // Get the page parameter from the request, default to 1 if not provided
	const perPage = 20;

	const admin = req.session.admin;
	const { startDate, endDate } = req.query;

	const now = moment();

	try {
		const downloads = await Download.find()
			.sort({ createdAt: -1 })
			.skip((page - 1) * perPage)
			.limit(perPage)
			.lean();

		const filteredDownloads = await Download.find({
			createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
		})
			.sort({ createdAt: -1 })
			.skip((page - 1) * perPage)
			.limit(perPage)
			.lean();

		const totalDownloads = await Download.countDocuments({
			createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
		});

		const iosDownloads = await Download.find({
			createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
			os: "iOS",
		});
		const totalIosDownloads = iosDownloads.length;

		const androidDownloads = await Download.find({
			createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
			os: "Android",
		});
		const totalAndroidDownloads = androidDownloads.length;

		const dailyDownloads = downloads.filter((download) =>
			moment(download.createdAt).isSame(now, "day")
		).length;

		const weeklyDownloads = downloads.filter((download) =>
			moment(download.createdAt).isSame(now, "week")
		).length;

		const monthlyDownloads = downloads.filter((download) =>
			moment(download.createdAt).isSame(now, "month")
		).length;

		const yearlyDownloads = downloads.filter((download) =>
			moment(download.createdAt).isSame(now, "year")
		).length;

		return res.status(200).render("dashboard/download/history", {
			pageTitle: "Downloads | ZeeMoney Dashboard",
			path: "/downloads/filtered",
			errors: false,
			errorMessage: false,
			successMessage: false,
			csrfToken: req.csrfToken(),
			admin: admin,
			downloads: filteredDownloads,
			shortDate: shortDate,
			totalPages: Math.ceil(totalDownloads / perPage),
			currentPage: page,
			totalDownloads: totalDownloads,
			totalIosDownloads: totalIosDownloads,
			totalAndroidDownloads: totalAndroidDownloads,
			dailyDownloads: dailyDownloads,
			weeklyDownloads: weeklyDownloads,
			monthlyDownloads: monthlyDownloads,
			yearlyDownloads: yearlyDownloads,
			startDate: startDate,
			endDate: endDate,
		});
	} catch (error) {
		console.log("error", error);
		return res.status(500).render("error", {
			pageTitle: "Error | ZeeMoney Dashboard",
			path: "/error",
			errors: false,
			csrfToken: req.csrfToken(),
			admin: admin,
			errorMessage: "Internal Server Error",
			downloads: false,
			totalPages: false,
			currentPage: false,
			totalDownloads: false,
		});
	}
}

async function downloadCSV(req, res) {
	await downloadCSVHelper(req, res, Download, "downloads");
}

async function viewDownload(req, res) {
	const admin = req.session.admin;
	const downloadId = req.params.id;

	try {
		const download = await Download.findById(downloadId).lean();

		return res.status(200).render("dashboard/download/view", {
			pageTitle: "Download | ZeeMoney Dashboard",
			path: "/downloads",
			errors: false,
			errorMessage: false,
			successMessage: false,
			csrfToken: req.csrfToken(),
			admin: admin,
			download: download,
			shortDate: shortDate,
		});
	} catch (error) {
		console.log("error", error);
		return res.status(500).render("error", {
			pageTitle: "Error | ZeeMoney Dashboard",
			path: "/error",
			errors: false,
			csrfToken: req.csrfToken(),
			admin: admin,
			errorMessage: "Internal Server Error",
			download: false,
		});
	}
}

module.exports = {
	getDevices,
	getDownloadsPage,
	downloadCSV,
	filterDownloads,
	viewDownload,
};
