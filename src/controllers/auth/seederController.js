require("dotenv").config();
const { randId } = require('../../helpers/randId');
const { v4: uuidv4 } = require('uuid');

const Region = require("../../models/region.model");
const Permission = require("../../models/permission");
const District = require("../../models/district.model");

const seedPermissions = [
	{
		id: 1,
		name: "manage_users",
	},
	{
		id: 2,
		name: "manage_client_onboarding",
	},
	{
		id: 3,
		name: "manage_regions",
	},
	{
		id: 4,
		name: "manage_vehicles",
	},
	{
		id: 5,
		name: "manage_client_scheduling",
	},
	{
		id: 6,
		name: "manage_expenses",
	},
	{
		id: 7,
		name: "manage_reminders",
	},
	{
		id: 8,
		name: "manage_services",
	},
	{
		id: 9,
		name: "manage_vendors",
	},
	{
		id: 10, // Corrected duplicated id
		name: "manage_sms",
	},
	{
		id: 11, // Corrected duplicated id
		name: "manage_reports",
	},
];

const districtArray = ["Ablekuma Central", "Ablekuma North", "Ablekuma West", "Accra", "Ada East", "Ada West", "Adenta", "Ashaiman", "Ayawaso Central", "Ayawaso East", "Ayawaso North", "Ayawaso West", "Ga Central", "Ga East", "Ga North", "Ga South", "Ga West", "Korle-Klottey", "Kpone-Katamanso", "Krowor", "La-Dade-Kotopon", "La-Nkwantanang-Madina", "Ledzokuku", "Ningo-Prampram", "Okaikwei North", "Shai-Osudoku", "Tema Metropolitan", "Tema West", "Weija Gbawe"];

const regionsArray = ['Ahafo Region', 'Ashanti Region', 'Bono East Region', 'Brong-Ahafo Region', 'Central Region', 'Eastern Region', 'Greater Accra Region', 'Northern Region', 'North East Region', 'Oti Region', 'Savannah Region', 'Upper East Region', 'Upper West Region', 'Volta Region', 'Western North Region', 'Western Region']


function seedRegionData(adminId) {
	const regions = regionsArray.map(region => {
		const regionId = uuidv4();
		const regionCode = randId().toString();

		return {
			id: regionId,
			code: regionCode,
			name: region,
			createdBy: adminId,
		};
	});
	return regions;
}

function seedDistrictData(adminId) {
	const districts = districtArray.map(district => {
		const districtId = uuidv4();
		const districtCode = randId().toString();
		return {
			id: districtId,
			code: districtCode,
			name: district,
			region: 'Greater Accra Region',
			createdBy: adminId,
		};
	});
	return districts;
}

exports.seeder = async (req, res) => {
	try {
		const admin = req.session.user;

		const seedRegion = seedRegionData(admin._id);
		const seedDistrict = seedDistrictData(admin._id);

		// Clear existing data and insert new data
		await Region.deleteMany({});
		await District.deleteMany({});

		await Promise.all([
			Region.insertMany(seedRegion),
			District.insertMany(seedDistrict)
		]);

		return res.status(200).json({
			success: true,
		});
	} catch (error) {
		console.error("Error in seeder:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};
