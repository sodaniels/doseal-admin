const User = require('../../models/user');
const Region = require('../../models/region.model');
const District = require('../../models/district.model');
const Assembly = require('../../models/assembly.model');
const { Log } = require("../../helpers/Log");
const { shortData, longDate } = require('../../helpers/shortData');
const { randId } = require('../../helpers/randId');
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require('uuid');


/** districts */
async function listDistricts(req, res) {
    const districts = await District.find({}).populate('createdBy').sort({ _id: -1 });
    try {

        if (districts) {
            return res.status(200).render("admin/divisions/district", {
                pageTitle: "District List",
                path: "/districts",
                errors: false,
                errorMessage: false,
                successMessage: false,
                region: false,
                district: false,
                districts: districts,
                csrfToken: req.csrfToken(),
                shortData: shortData
            });
        }

        return res.status(422).render("admin/divisions/district", {
            pageTitle: "District List",
            path: "/districts",
            errors: false,
            errorMessage: false,
            successMessage: false,
            region: false,
            district: false,
            districts: districts,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    } catch (error) {
        return res.status(422).render("admin/divisions/district", {
            pageTitle: "District List",
            path: "/districts",
            errors: true,
            errorMessage: 'An error occurrred',
            successMessage: false,
            region: false,
            district: false,
            districts: districts,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }
}

async function getAddDistrict(req, res) {
    const districts = await District.find({}).populate('createdBy').sort({ _id: -1 });
    try {

        if (districts) {
            return res.status(200).render("admin/divisions/add-district", {
                pageTitle: "Add District",
                path: "/add-district",
                errors: false,
                errorMessage: false,
                successMessage: false,
                users: false,
                region: false,
                district: false,
                districts: districts,
                csrfToken: req.csrfToken(),
                shortData: shortData
            });
        }

        return res.status(422).render("admin/divisions/add-district", {
            pageTitle: "Add District",
            path: "/add-district",
            errors: false,
            errorMessage: false,
            successMessage: false,
            users: false,
            region: false,
            district: false,
            districts: districts,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    } catch (error) {
        return res.status(422).render("admin/divisions/add-district", {
            pageTitle: "Add District",
            path: "/add-district",
            errors: true,
            errorMessage: 'An error occurrred',
            successMessage: false,
            users: false,
            region: false,
            district: false,
            districts: districts,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }
}

async function postAddDistrict(req, res) {
    Log.info("data: " + JSON.stringify(req.body));

    const districts = await District.find({}).populate('createdBy').sort({ _id: -1 });
    const errors = validationResult(req);
    let selectedRegion = req.body.region;
    if (!errors.isEmpty()) {
        Log.info('Error' + JSON.stringify(errors));
        return res.status(422).render("admin/divisions/district", {
            pageTitle: "District List",
            path: "/districts",
            errors: errors.array(),
            errorMessage: 'An error occurrred',
            successMessage: false,
            users: false,
            region: selectedRegion,
            district: false,
            districts: districts,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }

    try {

        const districtId = uuidv4();
        const districtCode = randId().toString();
        const admin = req.session.user;

        const arrayName = req.body.name;
        const arrayRegion = req.body.region;

        const districtArray = arrayName.map((name, index) => {
            return {
                id: districtId,
                code: districtCode,
                name: name,
                region: arrayRegion[index],
                createdBy: admin._id,
            };
        });

        const savedDistricts = await District.insertMany(districtArray);

        if (savedDistricts) {
            req.flash('success', 'District(s) added successfully');
            return res.redirect("/districts");
        } else {
            req.flash('error', 'An error has occurred');
            return res.redirect("/districts");
        }



    } catch (error) {
        req.flash('error', 'An error has occurred');
        return res.redirect("/districts");
    }
}

async function getDeleteDistrict(req, res) {

    const region = await District.findOneAndDelete({ id: req.params.id });
    if (region) {
        req.flash('success', 'District deleted successfully');
        return res.redirect("/districts");
    }

    const districts = await District.find({}).populate('createdBy').sort({ _id: -1 });
    return res.status(422).render("admin/divisions/district", {
        pageTitle: "District List",
        path: "/districts",
        errors: false,
        errorMessage: 'And error occurred while deleting region',
        successMessage: false,
        users: false,
        district: false,
        districts: districts,
        csrfToken: req.csrfToken(),
        shortData: shortData
    });


}


async function getEditDistrict(req, res) {

    try {
        const district = await District.findOne({ id: req.params.id }).populate('createdBy');
        if (district) {
            return res.status(200).render("admin/divisions/add-district", {
                pageTitle: "Edit District",
                path: "/add-district",
                errors: false,
                errorMessage: false,
                successMessage: false,
                users: false,
                region: false,
                district: district,
                districts: false,
                csrfToken: req.csrfToken(),
                shortData: shortData
            });
        }

        return res.status(422).render("admin/divisions/add-district", {
            pageTitle: "Edit District",
            path: "/add-district",
            errors: false,
            errorMessage: false,
            successMessage: false,
            users: false,
            region: false,
            district: district,
            districts: false,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    } catch (error) {
        return res.status(422).render("admin/divisions/add-district", {
            pageTitle: "Edit District",
            path: "/add-district",
            errors: true,
            errorMessage: 'An error occurrred',
            successMessage: false,
            users: false,
            region: false,
            district: false,
            districts: false,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }
}

async function putEditDistrict(req, res) {
    let selectRegion = req.body.region;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/divisions/add-district", {
            pageTitle: "Add District",
            path: "/add-district",
            errors: errors.array(),
            errorMessage: false,
            successMessage: false,
            region: selectRegion,
            district: false,
            districts: false,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }

    try {
        const admin = req.session.user;

        const updateDistrictSave = await District.findOneAndUpdate({ id: req.params.id }, {
            region: req.body.region,
            name: req.body.name,
            updatedBy: admin._id,
        });

        if (updateDistrictSave) {
            req.flash('success', 'District updated successfully');
            return res.redirect(`/district/edit/${req.params.id}`);
        } else {
            req.flash('error', 'An error occurred while updating district');
            return res.redirect(`/district/edit/${req.params.id}`);
        }


    } catch (error) {
        req.flash('error', 'An error has occurred');
        return res.redirect("/districts");
    }
}
/** districts */

async function listAssemblies(req, res) {
    const assemblies = await Assembly.find({}).populate('createdBy').sort({ _id: -1 });
    try {

        if (assemblies) {
            return res.status(200).render("admin/divisions/assembly", {
                pageTitle: "Assembly List",
                path: "/assemblies",
                errors: false,
                errorMessage: false,
                successMessage: false,
                district: false,
                assemblie: false,
                assemblies: assemblies,
                csrfToken: req.csrfToken(),
                shortData: shortData
            });
        }

        return res.status(422).render("admin/divisions/assembly", {
            pageTitle: "Assembly List",
            path: "/assemblies",
            errors: false,
            errorMessage: false,
            successMessage: false,
            district: false,
            assemblie: false,
            assemblies: assemblies,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    } catch (error) {
        return res.status(422).render("admin/divisions/assembly", {
            pageTitle: "Assembly List",
            path: "/assemblies",
            errors: true,
            errorMessage: 'An error occurrred',
            successMessage: false,
            region: false,
            district: false,
            districts: districts,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }
}

async function getAddAssembly(req, res) {
    const districts = await District.find({}).populate('createdBy').sort({ _id: -1 });
    try {
        if (districts) {
            return res.status(200).render("admin/divisions/add-assembly", {
                pageTitle: "Add Assembly",
                path: "/add-assembly",
                errors: false,
                errorMessage: false,
                successMessage: false,
                assembly: false,
                district: false,
                districts: districts,
                csrfToken: req.csrfToken(),
                shortData: shortData
            });
        }

        return res.status(200).render("admin/divisions/add-assembly", {
            pageTitle: "Add Assembly",
            path: "/add-assembly",
            errors: false,
            errorMessage: false,
            successMessage: false,
            assembly: false,
            district: false,
            districts: districts,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    } catch (error) {
        return res.status(200).render("admin/divisions/add-assembly", {
            pageTitle: "Add Assembly",
            path: "/add-assembly",
            errors: true,
            errorMessage: 'An error occurrred',
            successMessage: false,
            assembly: false,
            district: false,
            districts: districts,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }
}

async function postAddAssembly(req, res) {

    const districts = await District.find({}).populate('createdBy').sort({ _id: -1 });

    const errors = validationResult(req);
    let selectedDistrict = req.body.district;

    if (!errors.isEmpty()) {
        Log.info('Error' + JSON.stringify(errors));
        return res.status(422).render("admin/divisions/add-assembly", {
            pageTitle: "Assembly List",
            path: "/assemblies",
            errors: errors.array(),
            errorMessage: 'An error occurrred',
            successMessage: false,
            district: selectedDistrict,
            assembly: false,
            districts: districts,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }

    try {

        const assemblyId = uuidv4();
        const assemblyCode = randId().toString();
        const admin = req.session.user;

        const arrayName = req.body.name;
        const arrayDistrict = req.body.district;

        const assemblyArray = arrayName.map((name, index) => {
            return {
                id: assemblyId,
                code: assemblyCode,
                name: name,
                district: arrayDistrict[index],
                createdBy: admin._id,
            };
        });

        const savedAssemblies = await Assembly.insertMany(assemblyArray);

        if (savedAssemblies) {
            req.flash('success', 'Assembly added successfully');
            return res.redirect("/assemblies");
        } else {
            req.flash('error', 'Assembly could not be added');
            return res.redirect("/assemblies");
        }



    } catch (error) {
        req.flash('error', 'An error has occurred');
        return res.redirect("/districts");
    }
}

async function getEditAssembly(req, res) {
    try {
        const districts = await District.find({}).populate('createdBy').sort({ _id: -1 });
        const assembly = await Assembly.findOne({ id: req.params.id }).populate('createdBy');
        if (assembly) {
            return res.status(200).render("admin/divisions/add-assembly", {
                pageTitle: "Edit Assembly",
                path: "/add-assembly",
                errors: false,
                errorMessage: false,
                successMessage: false,
                district: assembly.district,
                assembly: assembly,
                districts: districts,
                csrfToken: req.csrfToken(),
                shortData: shortData
            });
        } else {
            return res.redirect("/assemblies");
        }
    } catch (error) {
        req.flash('error', 'An error occurred');
        return res.redirect("/assemblies");
    }
}

async function putEditAssembly(req, res) {
    const assembly = await Assembly.findOne({ id: req.params.id }).populate('createdBy');
    let selectDistrict = req.body.district;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/divisions/add-assembly", {
            pageTitle: "Edit Assembly",
            path: "/add-assembly",
            errors: errors.array(),
            errorMessage: false,
            successMessage: false,
            district: selectDistrict,
            assembly: assembly,
            assemblie: false,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }

    try {
        const admin = req.session.user;

        const updateAssembly = await Assembly.findOneAndUpdate({ id: req.params.id }, {
            district: req.body.district,
            name: req.body.name,
            updatedBy: admin._id,
        });

        if (updateAssembly) {
            req.flash('success', 'Assembly updated successfully');
            return res.redirect(`/assembly/edit/${req.params.id}`);
        } else {
            req.flash('error', 'An error occurred while updating district');
            return res.redirect(`/assembly/edit/${req.params.id}`);
        }


    } catch (error) {
        req.flash('error', 'An error has occurred');
        return res.redirect("/assemblies");
    }
}

async function getDeleteAssembly(req, res) {
    const assembly = await Assembly.findOneAndDelete({ id: req.params.id });
    if (assembly) {
        req.flash('success', 'Assembly deleted successfully');
        return res.redirect("/assemblies");
    } else {
        req.flash('error', ' And error occurred while deleting region');
        return res.redirect("/assemblies");
    }

}

async function selectDistricts(req, res) {
    const { region } = req.query;

    try {
        const districts = await District.find({ region });
        return res.status(200).json(districts);

    } catch (error) {
        return res.status(500).json({
            error: true
        });
    }

}

async function selectAssemblies(req, res) {
    const { district } = req.query;

    try {
        const assemblies = await Assembly.find({ district });
        return res.status(200).json(assemblies);

    } catch (error) {
        return res.status(500).json({
            error: true
        });
    }

}



module.exports = {
    //districts
    listDistricts,
    postAddDistrict,
    getAddDistrict,
    getEditDistrict,
    putEditDistrict,
    getDeleteDistrict,
    //assemblies
    listAssemblies,
    getAddAssembly,
    postAddAssembly,
    getEditAssembly,
    putEditAssembly,
    getDeleteAssembly,
    selectDistricts,
    selectAssemblies
};
