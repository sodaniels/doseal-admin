const axios = require("axios");
const { validationResult } = require("express-validator");
const User = require('../../models/user');
const Admin = require('../../models/admin.model');
const Schedule = require('../../models/schedule.model');
const CompletedJob = require("../../models/completed-job.model");
const RestServices = require("../../services/api/RestServices");
const restServices = new RestServices();
const Helpers = require("../../helpers/helper");
const helpers = new Helpers();

async function getIndex(req, res) {
    let prepadidBalance, posBalance;
    let totalUsers, systemUsers, totalSchedules, completePickups;
    try {
        totalUsers = await User.countDocuments({ role: 'Subscriber' });
        systemUsers = await Admin.countDocuments({ });
        totalSchedules = await Schedule.countDocuments({});
        completePickups = await CompletedJob.countDocuments({});
        prepadidBalance = await restServices.getPrepaidBalanceQueryService(); 
        posBalance = await restServices.getPosBalanceQueryService();
        console.log('posBalance: ' + JSON.stringify(posBalance)); 
        
    } catch (error) {
        console.error(error);
    }

    return res.render('backend/index', {
        pageTitle: 'Dashboard',
        path: '/admin/index',
        errors: false,
        errorMessage: false,
        csrfToken: req.csrfToken(),
        totalUsers: totalUsers ? totalUsers : 0,
        systemUsers: systemUsers ? systemUsers : 0,
        totalSchedules: totalSchedules ? totalSchedules : 0,
        completePickups: completePickups ? completePickups : 0,
        prepadidBalance: prepadidBalance ? prepadidBalance : 0,
        posBalance: posBalance ? posBalance : 0,
        admin: req.session.user,
        convertTo2Decimal: helpers.convertTo2Decimal,
    });
}

async function getIndex1(req, res) {
    let totalUsers, systemUsers, totalSchedules, completePickups, posBalance;
    try {
        totalUsers = await User.countDocuments({ role: 'Subscriber' });
        systemUsers = await Admin.countDocuments({ });
        totalSchedules = await Schedule.countDocuments({});
        completePickups = await CompletedJob.countDocuments({});
        prepadidBalance = await restServices.getPrepaidBalanceQueryService(); 
        posBalance = await restServices.getPosBalanceQueryService();
        console.log('posBalance: ' + JSON.stringify(posBalance)); 
        
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
        prepadidBalance: prepadidBalance ? prepadidBalance : 0,
        posBalance: posBalance ? posBalance : 0,
        admin: req.session.user,
        convertTo2Decimal: helpers.convertTo2Decimal,
    });
}


module.exports = {
    getIndex,
    getIndex1,
};
