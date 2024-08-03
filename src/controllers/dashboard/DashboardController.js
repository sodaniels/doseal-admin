const axios = require("axios");
const { validationResult } = require("express-validator");
const User = require('../../models/user');
const Admin = require('../../models/admin.model');
const Schedule = require('../../models/schedule.model');
const CompletedJob = require("../../models/completed-job.model");

async function getIndex1(req, res) {

}


async function getIndex(req, res) {
    let totalUsers, systemUsers, totalSchedules, completePickups;
    try {
        totalUsers = await User.countDocuments({ role: 'Subscriber' });
        systemUsers = await Admin.countDocuments({ });
        totalSchedules = await Schedule.countDocuments({});
        completePickups = await CompletedJob.countDocuments({});
        
    } catch (error) {
        console.error(error);
    }
    return res.render('admin/index', {
        pageTitle: 'Dashboard',
        path: '/admin/index',
        errors: false,
        errorMessage: false,
        csrfToken: req.csrfToken(),
        totalUsers: totalUsers ? totalUsers : 0,
        systemUsers: systemUsers ? systemUsers : 0,
        totalSchedules: totalSchedules ? totalSchedules : 0,
        completePickups: completePickups ? completePickups : 0,
    });
}


module.exports = {
    getIndex,
    getIndex1
};
