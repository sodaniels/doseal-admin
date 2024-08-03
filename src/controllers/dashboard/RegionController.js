const User = require('../../models/user');
const Region = require('../../models/region.model');
const { Log } = require("../../helpers/Log");
const { shortData, longDate } = require('../../helpers/shortData');
const { rand10Id, randId } = require('../../helpers/randId');
const { validationResult } = require("express-validator");
const { Hash } = require('../../helpers/hash');
const { v4: uuidv4 } = require('uuid');
const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');


async function listRegions(req, res) {
    const regions = await Region.find({}).sort({ _id: -1 });
    try {

        if (regions) {
            return res.status(200).render("admin/region/list", {
                pageTitle: "Regions List",
                path: "/regions",
                errors: false,
                errorMessage: false,
                successMessage: false,
                users: false,
                region: false,
                regions: regions,
                csrfToken: req.csrfToken(),
                shortData: shortData
            });
        }

        return res.status(422).render("admin/region/list", {
            pageTitle: "Regions List",
            path: "/regions",
            errors: false,
            errorMessage: false,
            successMessage: true,
            users: false,
            regions: regions,
            region: false,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    } catch (error) {
        res.render('admin/region/list', {
            pageTitle: "Regions List",
            path: "/regions",
            errors: false,
            errorMessage: error,
            users: false,
            region: false,
            regions: regions,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }
}

async function postAddRegion(req, res) {
    const regions = await Region.find({}).sort({ _id: -1 });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        Log.info('Error' + JSON.stringify(errors));
        return res.status(422).render("admin/region/list", {
            pageTitle: "Region List",
            path: "/regions",
            errors: false,
            errorMessage: false,
            successMessage: false,
            users: false,
            region: false,
            regions: regions,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }

    try {
        const RegionId = uuidv4();
        const regionCode = randId().toString();
        const admin = req.session.user;

        const newRegion = new Region({
            id: RegionId.toString(),
            code: regionCode,
            city: req.body.city,
            name: req.body.name,
            createdBy: admin.user_id,
        });

        const savedRegion = await newRegion.save();

        if (savedRegion) {
            const regions = await Region.find({}).sort({ _id: -1 });
            return res.status(200).render("admin/region/list", {
                pageTitle: "Region List",
                path: "/regions",
                errors: false,
                errorMessage: false,
                successMessage: 'Region saved successfully',
                users: false,
                regions: regions,
                region: false,
                regions: regions,
                csrfToken: req.csrfToken(),
                shortData: shortData
            });
        }

        return res.status(422).render("admin/region/list", {
            pageTitle: "Region List",
            path: "/regions",
            errors: false,
            errorMessage: false,
            successMessage: false,
            users: false,
            region: false,
            regions: regions,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    } catch (error) {
        Log.info('Dustbin Saving Error: ' + error);
        return res.status(422).render("admin/region/list", {
            pageTitle: "Region List",
            path: "/regions",
            errors: false,
            errorMessage: error,
            successMessage: false,
            users: false,
            regions: regions,
            region: false,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }
}

async function getDeleteRegion(req, res) {
  

    console.log('id: ' + req.params.id)

    const region = await Region.findOneAndDelete({ id: req.params.id });
    if (region) {
        const regions = await Region.find({}).sort({ _id: -1 });
        return res.status(422).render("admin/region/list", {
            pageTitle: "Delete Region",
            path: "/regions",
            errors: false,
            errorMessage: false,
            successMessage: 'Region deleted successfully',
            users: false,
            region: false,
            regions: regions,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }

    const regions = await Region.find({}).sort({ _id: -1 });
    return res.status(422).render("admin/region/list", {
        pageTitle: "Region List",
        path: "/regions",
        errors: false,
        errorMessage: 'And error occurred while deleting region',
        successMessage: false,
        users: false,
        region: false,
        regions: regions,
        csrfToken: req.csrfToken(),
        shortData: shortData
    });


}



module.exports = {
    listRegions,
    postAddRegion,
    getDeleteRegion
};
