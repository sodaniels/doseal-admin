const qrCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');

const User = require('../../models/user');
const Region = require('../../models/region.model');
const Location = require('../../models/location.model');
const Dustbin = require('../../models/dustbin');
const { Log } = require("../../helpers/Log");
const { shortData, longDate } = require('../../helpers/shortData');
const { rand10Id } = require('../../helpers/randId');
const { validationResult } = require("express-validator");
const { Hash } = require('../../helpers/hash');


const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY


async function listOnboarding(req, res) {
    const users = await User.find({
        $or: [
            { role: 'Subscriber' },
            { role: 'Business' }
        ]
    }).sort({ _id: -1 });
    try {

        if (users) {
            return res.status(200).render("admin/onboarding/list", {
                pageTitle: "List Onboarded Users",
                path: "/onboarded/users",
                errors: false,
                errorMessage: false,
                successMessage: false,
                users: users,
                csrfToken: req.csrfToken(),
                shortData: shortData
            });
        }

        return res.status(422).render("admin/onboarding/list", {
            pageTitle: "List Onboarded Users",
            path: "/onboarded/users",
            errors: false,
            errorMessage: false,
            successMessage: true,
            users: users,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    } catch (error) {
        res.render('admin/users/list', {
            pageTitle: "List Onboarded Users",
            path: "/onboarded/users",
            errors: false,
            errorMessage: error,
            users: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData
        });
    }
}

async function getOnboarding(req, res) {
    const successMessage = req.query.successMessage || undefined;
    const errorMessage = req.query.errorMessage || undefined;
    const regions = await Region.find({});
    const admin = req.session.user;
    const locations = await Location.find({ addedBy: admin._id }).sort({ _id: -1 });

    res.render('admin/onboarding/add', {
        pageTitle: 'Onboarding',
        path: '/onboarding/user/add',
        errors: false,
        user: false,
        region: false,
        locations: locations,
        location: false,
        userInput: false,
        regions: regions,
        admin: req.session.user,
        errorMessage: errorMessage,
        successMessage: successMessage,
        csrfToken: req.csrfToken(),
    });
}

async function postOnboarding(req, res) {
    const errors = validationResult(req);
    const regions = await Region.find({});
    const requestBody = req.body;
    const selectedLocation = req.body.location;

    const admin = req.session.user;
    const locations = await Location.find({ addedBy: admin._id }).sort({ _id: -1 });

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/onboarding/add", {
            pageTitle: "User Onboarding",
            path: "/onboarding/user/add",
            user: false,
            admin: false,
            region: false,
            role: "Subscriber",
            locations: locations,
            location: selectedLocation,
            userInput: requestBody,
            regions: regions,
            errors: errors.array(),
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }

    try {
        const currentTimeStamp = new Date().getTime();
        const passwd = await Hash(currentTimeStamp.toString());
        const userId = uuidv4();
        const admin = req.session.user;

        const userLocation = await Location.findOne({ _id: req.body.location });

        const newUser = new User({
            userId: userId,
            adminId: admin.userId,
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            role: req.body.role,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            region: req.body.region,
            district: req.body.district,
            assembly: req.body.assembly,
            city: req.body.city,
            paymentMode: req.body.paymentMode,
            idType: req.body.idType,
            idNumber: req.body.idNumber,
            idExpiryDate: req.body.idExpiryDate,
            location: {
                lat: userLocation.lat,
                lng: userLocation.lng,
                address: userLocation.address
            },
            password: passwd,
            read: 1,
            createdBy: admin._id,
        });

        const savedCustomer = await newUser.save();

        if (savedCustomer) {
            res.redirect('../../onboarding/user/add?successMessage=User added successfully');
        } else {
            res.redirect('../../onboarding/user/add?errorMessage=User could not be added');
        }
    } catch (error) {
        res.redirect('../../onboarding/user/add?errorMessage=An error occurred while adding user');
    }
}

async function postBusinessOnboarding(req, res) {
    const errors = validationResult(req);
    const regions = await Region.find({});
    const requestBody = req.body;

    const admin = req.session.user;
    const locations = await Location.find({ addedBy: admin._id }).sort({ _id: -1 });

    // const idPhotoFile = req.files["idPhoto"][0];
    // const baseUrl = `${req.protocol}://${req.get("host")}`;
    // const idPhotoFileUrl = `${baseUrl}/uploads/identification/${idPhotoFile.filename}`;

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/onboarding/add", {
            pageTitle: "Business Onboarding",
            path: "onboarding/business/add",
            user: false,
            admin: false,
            region: false,
            role: "Business",
            userInput: requestBody,
            locations: locations,
            location: false,
            regions: regions,
            errors: errors.array(),
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }

    try {
        const currentTimeStamp = new Date().getTime();
        const passwd = await Hash(currentTimeStamp.toString());
        const businessId = uuidv4();
        const admin = req.session.user;

        const userLocation = await Location.findOne({ _id: req.body.location });

        const newBusiness = new User({
            userId: businessId,
            adminId: admin.userId,
            businessName: req.body.businessName,
            role: req.body.role,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            region: req.body.region,
            district: req.body.district,
            assembly: req.body.assembly,
            city: req.body.city,
            paymentMode: req.body.paymentMode,
            certificateOfIncorporation: req.body.certificateOfIncorporation,
            certificateOfCommenseBusiness: req.body.certificateOfCommenseBusiness,
            location: {
                lat: userLocation.lat,
                lng: userLocation.lng,
                address: userLocation.address
            },
            c1_fullname: req.body.c1_fullname,
            c1_phoneNumber: req.body.c1_phoneNumber,
            c1_email: req.body.c1_email,
            c2_fullname: req.body.c2_fullname,
            c2_phoneNumber: req.body.c2_phoneNumber,
            c2_email: req.body.c2_email,
            password: passwd,
            createdBy: admin._id,
            status: "Inactive",

        });

        const savedBusiness = await newBusiness.save();

        if (savedBusiness) {
            res.redirect('../../onboarding/user/add?successMessage=Business added successfully');
        } else {
            res.redirect('../../onboarding/user/add?errorMessage=Business could not be added');
        }
    } catch (error) {
        res.redirect('../../onboarding/user/add?errorMessage=An error occurred while adding business');
    }
}

async function getEditOnboarding(req, res) {
    const regions = await Region.find({});
    const user = await User.findOne({ userId: req.params.userId });

    const admin = req.session.user;
    const locations = await Location.find({ addedBy: admin._id }).sort({ _id: -1 });

    if (user) {
        const userRegion = user.region;

        res.render('admin/onboarding/add', {
            pageTitle: 'Edit User',
            path: `/onboarding/user/edit/${req.query.userId}`,
            user: user,
            admin: req.session.user,
            region: userRegion ? userRegion : '',
            regions: regions,
            locations: locations,
            location: false,
            userInput: false,
            errors: false,
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    } else {
        res.render('admin/onboarding/add', {
            pageTitle: 'Add User',
            path: `/onboarding/user/add`,
            user: false,
            region: false,
            regions: regions,
            locations: locations,
            location: false,
            userInput: false,
            admin: req.session.user,
            errors: false,
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }
}

async function putEditOnboarding(req, res) {
    const regions = await Region.find({});
    const user = await User.findOne({ userId: req.params.userId });
    const errors = validationResult(req);
    const userRegion = user.region;

    const admin = req.session.user;
    const locations = await Location.find({ addedBy: admin._id }).sort({ _id: -1 });

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/onboarding/add", {
            pageTitle: 'Edit Onboardered User',
            path: `/onboarding/user/edit/${req.query.userId}`,
            user: user,
            region: false,
            regions: regions,
            locations: locations,
            location: false,
            admin: req.session.user,
            errors: false,
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }

    try {


        const updatedCustomerData = {
            adminId: req.body.adminId,
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            city: req.body.city,
            region: req.body.region,
            idType: req.body.idType,
            idNumber: req.body.idNumber,
            idExpiryDate: req.body.idExpiryDate,
        };

        User.findOne({ userId: req.params.userId })
            .then((user) => {
                if (user) {
                    // Update the customer with the new data
                    Object.assign(user, updatedCustomerData);
                    // Save the changes to the database
                    return user.save();
                } else {
                    // Handle the case where the customer with the specified ID is not found
                    res.redirect('../../onboarding/user/add?successMessage=User updated successfully');
                }
            })
            .then((updatedUser) => {
                // Handle the case where the update was successful
                console.log('User updated successfully:', updatedUser);
                return res.status(422).render("admin/onboarding/add", {
                    pageTitle: "Edit Onboardered User",
                    path: `/onboarding/user/edit/${req.query.userId}`,
                    errors: false,
                    region: updatedUser ? updatedUser.region : '',
                    admin: req.session.user,
                    user: updatedUser,
                    errorMessage: false,
                    successMessage: 'User updated successfully',
                    csrfToken: req.csrfToken(),
                });
            })
            .catch((error) => {
                // Handle any errors that occurred during the update process
                console.error('Error updating user:', error.message);
                return res.status(422).render("admin/onboarding/add", {
                    pageTitle: "Edit Onboardered User",
                    path: `/onboarding/user/edit/${req.query.userId}`,
                    errors: false,
                    region: userRegion ? userRegion : '',
                    admin: req.session.user,
                    user: user,
                    errorMessage: error,
                    successMessage: false,
                    csrfToken: req.csrfToken(),
                });
            });

    } catch (error) {
        res.redirect('../../onboarding/user/add?errorMessage=An error occurred while updated user');
    }
}

async function getOnboardedUser(req, res) {
    let user = await User.findOne({ userId: req.params.userId });

    if (user) {
        const dustbins = await Dustbin.find({ owner: user._id })
        res.render('admin/onboarding/user-item', {
            pageTitle: 'Onboarding',
            path: `/onboarding/user/${req.query.userId}`,
            errors: false,
            user: user,
            region: false,
            admin: req.session.user,
            dustbin: false,
            dustbins: dustbins,
            errorMessage: false,
            successMessage: false,
            longDate: longDate,
            shortData: shortData,
            csrfToken: req.csrfToken(),
        });
    }
}

/**Dustbins */

async function getAddDustbin(req, res) {
    const user = await User.findOne({ userId: req.params.userId });
    const regions = await Region.find({});
    if (user) {
        return res.render('admin/onboarding/add-dustbin', {
            pageTitle: 'Add Dustbin',
            path: `/user/dustbin/add/${req.params.userId}`,
            errors: false,
            user: user,
            userId: user.userId,
            regions: regions,
            API_KEY: GOOGLE_API_KEY,
            region: false,
            dustbin: false,
            admin: req.session.user,
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }

}

async function postAddDustbin(req, res) {
    Log.info("[OnboardingController.js][postOnboarding] \t saving dustbin");
    const regions = await Region.find({});
    let user = await User.findOne({ userId: req.body.userId });
    const errors = validationResult(req);

    const locationData = req.body.hiddenLocation;
    const parsedLocationData = locationData.map(jsonString => JSON.parse(jsonString));
    const mergedLocationData = Object.assign({}, ...parsedLocationData);

    if (!errors.isEmpty()) {
        Log.info('Error' + JSON.stringify(errors));
        return res.status(422).render("admin/onboarding/add-dustbin", {
            pageTitle: "Add Dustbin",
            path: `/onboarding/user/${user.userId}`,
            user: user,
            admin: false,
            region: false,
            regions: regions,
            API_KEY: GOOGLE_API_KEY,
            errors: errors.array(),
            errorMessage: false,
            successMessage: false,
            dustbin: false,
            longDate: longDate,
            csrfToken: req.csrfToken(),
        });
    }

    try {
        const binId = uuidv4();
        const barcode = rand10Id().toString();
        const admin = req.session.user;

        const newBin = new Dustbin({
            id: binId.toString(),
            location: mergedLocationData,
            barcode: barcode,
            city: req.body.city,
            region: req.body.region,
            landmark: req.body.landmark,
            owner: user._id,
            status: 'INITIAL',
            createdBy: admin._id,
        });

        const savedDusbin = await newBin.save();

        if (savedDusbin) {
            const barcodeOptions = {
                bcid: 'code128', // Barcode type
                text: barcode,
                scale: 3, // Scaling factor
                height: 10, // Bar height, in millimeters
                includetext: true, // Include the text on the barcode
                textxalign: 'center', // Text horizontal alignment
            };

            try {
                // bwipjs.toBuffer(barcodeOptions, function (err, png) {
                //     if (err) {
                //         Log.info("[OnboardingController.js][postOnboarding] \t********************************", err);
                //     } else {
                //         // Save barcode image

                //         const folderPath = path.join(__dirname, '..', '..', 'public', 'barcodes');
                //         // Ensure the destination folder exists, if not, create it
                //         if (!fs.existsSync(folderPath)) {
                //             fs.mkdirSync(folderPath, { recursive: true });
                //         }
                //         const filePath = path.join(folderPath, barcode + '.png');

                //         fs.writeFile(filePath, png, function (err) {
                //             if (err) {
                //                 Log.info("[OnboardingController.js][postOnboarding] \t********************************", err);
                //             } else {
                //                 Log.info("[OnboardingController.js][postOnboarding] \t Barcode image saved successfully.");
                //             }
                //         });
                //     }
                // });

                // Generate QR code as a data URL
                const qrDataURL = await qrCode.toDataURL(barcode);

                // Convert data URL to buffer
                const buffer = Buffer.from(qrDataURL.replace(/^data:image\/png;base64,/, ''), 'base64');

                // Define the folder path to save the QR codes
                const folderPath = path.join(__dirname, '..', '..', 'public', 'qrcodes');

                // Ensure the destination folder exists, if not, create it
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }

                // Define the file path to save the QR code
                const filePath = path.join(folderPath, `${barcode}.png`);

                // Write the buffer to a .png file
                fs.writeFileSync(filePath, buffer);



            } catch (error) {
                Log.info("[OnboardingController.js][postOnboarding][error]", error);
            }
        }



        if (savedDusbin) {
            Log.info("[OnboardingController.js][postOnboarding] redirecting");
            const dustbins = await Dustbin.find({ owner: user._id });
            return res.status(200).render("admin/onboarding/user-item", {
                pageTitle: "Add Dustbin",
                path: `/onboarding/user/${req.query.userId}`,
                errors: false,
                user: user,
                region: false,
                regions: regions,
                admin: req.session.user,
                errorMessage: false,
                dustbin: false,
                dustbins: dustbins,
                API_KEY: GOOGLE_API_KEY,
                longDate: longDate,
                shortData: shortData,
                successMessage: "User added successfully",
                csrfToken: req.csrfToken(),
            });
        }

        return res.status(422).render("admin/onboarding/add-dustbin", {
            pageTitle: "Add Dustbin",
            path: `/onboarding/user/${user.userId}`,
            errors: errors.array(),
            user: false,
            region: false,
            regions: regions,
            admin: req.session.user,
            API_KEY: GOOGLE_API_KEY,
            errorMessage: false,
            successMessage: false,
            dustbin: false,
            dustbins: false,
            longDate: longDate,
            csrfToken: req.csrfToken(),
        });
    } catch (error) {
        Log.info('Dustbin Saving Error' + error);
        return res.status(422).render("admin/onboarding/add-dustbin", {
            pageTitle: "Add Dustbin",
            path: `/onboarding/user/${user.userId}`,
            errors: errors.array(),
            user: user,
            region: false,
            regions: regions,
            admin: req.session.user,
            API_KEY: GOOGLE_API_KEY,
            errorMessage: error,
            successMessage: true,
            dustbin: false,
            dustbins: false,
            longDate: longDate,
            csrfToken: req.csrfToken(),
        });
    }
}

async function getEditDustbin(req, res) {
    const dustbin = await Dustbin.findOne({ id: req.params.dustbinId });
    const regions = await Region.find({});
    if (dustbin) {
        console.log('dustbin: ' + JSON.stringify(dustbin));
        const region = dustbin.region;
        const user = await User.findOne({ _id: dustbin.owner });
        return res.render('admin/onboarding/add-dustbin', {
            pageTitle: 'Add Dustbin',
            path: `/user/dustbin/edit/${req.params.userId}`,
            errors: false,
            user: user ? user : false,
            region: region,
            regions: regions,
            dustbin: dustbin,
            API_KEY: GOOGLE_API_KEY,
            dustbins: false,
            admin: req.session.user,
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }
}

async function putEditDustbin(req, res) {
    const dustbin = await Dustbin.findOne({ id: req.params.dustbinId });
    const regions = await Region.find({});

    const locationData = req.body.hiddenLocation;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const user = await User.findOne({ _id: dustbin.owner });
        Log.info('Error' + JSON.stringify(errors));
        return res.status(422).render("admin/onboarding/add-dustbin", {
            pageTitle: "Add Dustbin",
            path: `/user/dustbin/add/${user.userId}`,
            user: user,
            admin: false,
            region: false,
            regions: regions,
            API_KEY: GOOGLE_API_KEY,
            errors: errors.array(),
            errorMessage: false,
            successMessage: false,
            dustbin: dustbin,
            longDate: longDate,
            csrfToken: req.csrfToken(),
        });
    }


    const admin = req.session.user;
    const user = await User.findOne({ _id: dustbin.owner });

    try {
        const updatedDusbinData = {
            city: req.body.city,
            region: req.body.region,
            landmark: req.body.landmark,
            updatedBy: admin.user_id,
        };

        Dustbin.findOne({ id: req.params.dustbinId })
            .then((dustbin) => {
                if (dustbin) {
                    // Update the customer with the new data
                    Object.assign(dustbin, updatedDusbinData);
                    // Save the changes to the database
                    return dustbin.save();
                } else {
                    // Handle the case where the customer with the specified ID is not found
                    return res.render('admin/onboarding/user-item', {
                        pageTitle: 'Add Dustbin',
                        path: `/dustbin/edit/${req.params.dustbinId}`,
                        errors: false,
                        user: user ? user : false,
                        region: false,
                        regions: regions,
                        dustbin: dustbin,
                        API_KEY: GOOGLE_API_KEY,
                        dustbins: false,
                        admin: req.session.user,
                        errorMessage: false,
                        successMessage: false,
                        csrfToken: req.csrfToken(),
                    });
                }
            })
            .then(async (updatedDustbin) => {
                // Handle the case where the update was successful
                const dustbins = await Dustbin.find({ owner: user._id });
                console.log('Dustbin updated successfully:', updatedDustbin);
                return res.status(422).render("admin/onboarding/user-item", {
                    pageTitle: "Edit Onboardered User",
                    path: `/onboarding/user/${user.userId}`,
                    errors: false,
                    region: updatedDustbin ? updatedDustbin.region : '',
                    regions: regions,
                    admin: req.session.user,
                    user: user,
                    dustbin: updatedDustbin,
                    API_KEY: GOOGLE_API_KEY,
                    dustbins: dustbins,
                    longDate: longDate,
                    shortData: shortData,
                    errorMessage: false,
                    successMessage: 'Dustbin updated successfully',
                    csrfToken: req.csrfToken(),
                });
            })
            .catch((error) => {
                // Handle any errors that occurred during the update process
                console.error('Error updating user:', error.message);
                return res.status(422).render("admin/onboarding/add", {
                    pageTitle: "Edit Onboardered User",
                    path: `/dustbin/edit/${dustbin.id}`,
                    errors: false,
                    region: false,
                    regions: regions,
                    admin: req.session.user,
                    API_KEY: GOOGLE_API_KEY,
                    user: user,
                    errorMessage: error,
                    successMessage: false,
                    csrfToken: req.csrfToken(),
                });
            });




    } catch (error) {

    }



}

/**Dustbins */




function parseLocation(locationString) {
    // Split the location string by comma
    try {
        const parts = locationString.split(',');

        if (parts.length !== 2) {
            throw new Error('Invalid location format. It should be in the format "latitude,longitude".');
        }

        // Extract latitude and longitude
        const latitude = parseFloat(parts[0]);
        const longitude = parseFloat(parts[1]);

        if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error('Latitude and longitude must be valid numbers.');
        }

        return { latitude, longitude };
    } catch (error) {
        throw new Error(error.message);
    }

}


module.exports = {
    getOnboarding,
    postOnboarding,
    listOnboarding,
    getEditOnboarding,
    putEditOnboarding,
    getOnboardedUser,
    postAddDustbin,
    getAddDustbin,
    getEditDustbin,
    putEditDustbin,
    postBusinessOnboarding,
};
