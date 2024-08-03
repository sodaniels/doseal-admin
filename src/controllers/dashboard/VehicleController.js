const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require('uuid');
const customData = require('../../helpers/shortData');
const Vehicle = require('../../models/vehicle.model');
const Person = require('../../models/person.model');
const Assignment = require('../../models/assignment.model');
const { Log } = require("../../helpers/Log");
const { randId } = require('../../helpers/randId');

let carTypes = ["Car", "Bus", "Forklift", "Loader", "Motocycle"];
let statuses = ["Active", "Inactive", "In Shop", "Out of Service", "Sold"];
let ownerships = ["Owned", "Leased", "Rented", "Customer"];
let carMakes = ["Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus", "Lincoln", "Lotus", "Maserati", "Mazda", "McLaren", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Porsche", "Ram", "Rolls-Royce", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"];
let fuelTypes = ["Gasoline", "Diesel", "Electric", "Hybrid", "Flex Fuel", "Natural Gas", "Hydrogen", "Biodiesel", "Propane", "Ethanol", "Petrol"];



async function listVehicles(req, res) {
    const vehicles = await Vehicle.find({}).populate('createdBy');
    const assigneds = await Vehicle.find({ assignedStatus: 'Assigned' });
    const unassigneds = await Vehicle.find({ assignedStatus: 'Unassigned' });

    try {

        if (vehicles) {
            return res.render('admin/vehicles/list', {
                pageTitle: 'List Vehicles',
                path: '/vehicles',
                errors: false,
                vehicle: false,
                vehicles: vehicles,
                statuses: statuses,
                assigneds: assigneds,
                unassigneds: unassigneds,
                status: false,
                ownerships: ownerships,
                ownership: false,
                carMakes: carMakes,
                fuelTypes: fuelTypes,
                fuelType: false,
                make: false,
                userInput: false,
                admin: req.session.user,
                carTypes: carTypes,
                carType: false,
                errorMessage: false,
                successMessage: false,
                transformWord: customData.transformWord,
                shortData: customData.shortData,
                longDate: customData.longDate,
                csrfToken: req.csrfToken()
            });
        }
        return res.render('admin/vehicles/list', {
            pageTitle: 'List Vehicles',
            path: '/vehicles',
            errors: false,
            vehicle: false,
            vehicles: false,
            statuses: statuses,
            status: false,
            ownerships: ownerships,
            ownership: false,
            carMakes: carMakes,
            fuelTypes: fuelTypes,
            fuelType: false,
            make: false,
            userInput: false,
            admin: req.session.user,
            carTypes: carTypes,
            carType: false,
            errorMessage: false,
            successMessage: false,
            shortData: customData.shortData,
            transformWord: customData.transformWord,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        return res.render('admin/vehicles/add', {
            pageTitle: 'List Vehicles',
            path: '/vehicles',
            errors: false,
            vehicle: false,
            vehicles: vehicles,
            statuses: statuses,
            status: false,
            ownerships: ownerships,
            ownership: false,
            carMakes: carMakes,
            fuelTypes: fuelTypes,
            fuelType: false,
            make: false,
            userInput: false,
            admin: req.session.user,
            carTypes: carTypes,
            carType: false,
            errorMessage: false,
            successMessage: false,
            shortData: customData.shortData,
            transformWord: customData.transformWord,
            csrfToken: req.csrfToken()
        });
    }
}

async function getAddVehicle(req, res) {

    return res.render('admin/vehicles/add', {
        pageTitle: 'Add Vehicle',
        path: '/vehicle/add',
        errors: false,
        vehicle: false,
        statuses: statuses,
        status: false,
        ownerships: ownerships,
        ownership: false,
        carMakes: carMakes,
        fuelTypes: fuelTypes,
        fuelType: false,
        make: false,
        userInput: false,
        admin: req.session.user,
        carTypes: carTypes,
        carType: false,
        errorMessage: false,
        successMessage: false,
        transformWord: customData.transformWord,
        csrfToken: req.csrfToken()
    });
}

async function postAddVehicle(req, res) {
    const errors = validationResult(req);
    let selectStatus = req.body.status;
    let selectOwnership = req.body.ownership;
    let selectMake = req.body.make;
    let selectFuelType = req.body.fuelType;
    let selectCarType = req.body.carType;
    const requestBody = req.body;

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/vehicles/add", {
            pageTitle: 'Add Vehicle',
            path: '/vehicle/add',
            errors: errors.array(),
            vehicle: false,
            statuses: statuses,
            status: selectStatus,
            ownerships: ownerships,
            ownership: selectOwnership,
            carMakes: carMakes,
            make: selectMake,
            fuelTypes: fuelTypes,
            fuelType: selectFuelType,
            admin: req.session.user,
            carTypes: carTypes,
            carType: selectCarType,
            errorMessage: false,
            successMessage: false,
            transformWord: customData.transformWord,
            userInput: requestBody,
            csrfToken: req.csrfToken()
        });
    }

    try {
        const vId = uuidv4();
        const vehicleShortId = randId();
        const admin = req.session.user;
        console.log('admin: ', admin)

        const newVehicle = new Vehicle({
            id: vId,
            vehicleId: vehicleShortId,
            name: req.body.name,
            carType: req.body.carType,
            status: req.body.status,
            year: req.body.year,
            make: req.body.make,
            model: req.body.model,
            vehicleNumber: req.body.vehicleNumber,
            fuelType: req.body.fuelType,
            ownership: req.body.ownership,
            createdBy: admin ? admin._id : '',
        });

        const savedVehicle = await newVehicle.save();

        if (savedVehicle) {
            return res.status(200).render("admin/vehicles/add", {
                pageTitle: 'Add Vericle',
                path: '/vehicle/add',
                errors: false,
                vehicle: false,
                statuses: statuses,
                status: selectStatus,
                ownerships: ownerships,
                ownership: selectOwnership,
                carMakes: carMakes,
                make: selectMake,
                fuelTypes: fuelTypes,
                fuelType: selectFuelType,
                userInput: false,
                admin: req.session.user,
                carTypes: carTypes,
                carType: selectCarType,
                errorMessage: false,
                successMessage: 'Vehicle added successfully',
                transformWord: customData.transformWord,
                requestBody: requestBody,
                csrfToken: req.csrfToken()
            });
        }

        return res.status(422).render("admin/vehicles/add", {
            pageTitle: 'Add Vericle',
            path: '/vehicle/add',
            errors: false,
            vehicle: false,
            statuses: statuses,
            status: selectStatus,
            ownerships: ownerships,
            ownership: selectOwnership,
            carMakes: carMakes,
            make: selectMake,
            fuelTypes: fuelTypes,
            fuelType: selectFuelType,
            userInput: false,
            admin: req.session.user,
            carTypes: carTypes,
            carType: selectCarType,
            errorMessage: "An error occurred while adding vehicle",
            successMessage: false,
            transformWord: customData.transformWord,
            requestBody: requestBody,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        return res.status(422).render("admin/vehicles/add", {
            pageTitle: 'Add Vericle',
            path: '/vehicle/add',
            errors: false,
            vehicle: false,
            statuses: statuses,
            status: selectStatus,
            ownerships: ownerships,
            ownership: selectOwnership,
            carMakes: carMakes,
            make: selectMake,
            fuelTypes: fuelTypes,
            fuelType: selectFuelType,
            userInput: false,
            admin: req.session.user,
            carTypes: carTypes,
            carType: selectCarType,
            errorMessage: error,
            successMessage: false,
            transformWord: customData.transformWord,
            requestBody: requestBody,
            csrfToken: req.csrfToken()
        });
    }
}

async function getEditVehicle(req, res) {
    const vehicle = await Vehicle.findOne({ id: req.params.id });
    if (vehicle) {
        let selectStatus = vehicle.status;
        let selectOwnership = vehicle.ownership;
        let selectMake = vehicle.make;
        let selectFuelType = vehicle.fuelType;
        let selectCarType = vehicle.carType;

        return res.status(422).render("admin/vehicles/add", {
            pageTitle: 'Edit Vehicle',
            path: '/vehicle/edit',
            errors: false,
            vehicle: vehicle,
            statuses: statuses,
            status: selectStatus,
            ownerships: ownerships,
            ownership: selectOwnership,
            carMakes: carMakes,
            make: selectMake,
            fuelTypes: fuelTypes,
            fuelType: selectFuelType,
            admin: req.session.user,
            carTypes: carTypes,
            carType: selectCarType,
            errorMessage: false,
            successMessage: false,
            transformWord: customData.transformWord,
            userInput: false,
            csrfToken: req.csrfToken()
        });
    } else {
        return res.render('admin/vehicles/add', {
            pageTitle: 'Edit Vehicle',
            path: '/vehicle/edit',
            errors: false,
            vehicle: false,
            statuses: statuses,
            status: false,
            ownerships: ownerships,
            ownership: false,
            carMakes: carMakes,
            fuelTypes: fuelTypes,
            fuelType: false,
            make: false,
            userInput: false,
            admin: req.session.user,
            carTypes: carTypes,
            carType: false,
            errorMessage: false,
            successMessage: false,
            transformWord: customData.transformWord,
            csrfToken: req.csrfToken()
        });
    }


}

async function putEditVehicle(req, res) {
    let selectStatus = req.body.status;
    let selectOwnership = req.body.ownership;
    let selectMake = req.body.make;
    let selectFuelType = req.body.fuelType;
    let selectCarType = req.body.carType;
    let requestBody = req.body;

    const vehicle = await Vehicle.findOne({ id: req.params.id });
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/vehicles/add", {
            pageTitle: 'Edit Vehicle',
            path: `/vehicle/edit/${req.params.id}`,
            errors: errors.array(),
            vehicle: vehicle,
            statuses: statuses,
            status: selectStatus,
            ownerships: ownerships,
            ownership: selectOwnership,
            carMakes: carMakes,
            make: selectMake,
            fuelTypes: fuelTypes,
            fuelType: selectFuelType,
            admin: req.session.user,
            carTypes: carTypes,
            carType: selectCarType,
            errorMessage: false,
            successMessage: false,
            transformWord: customData.transformWord,
            userInput: requestBody,
            csrfToken: req.csrfToken()
        });
    }

    try {

        const updatedVehicleData = {
            name: req.body.name,
            carType: req.body.carType,
            status: req.body.status,
            year: req.body.year,
            make: req.body.make,
            model: req.body.model,
            vehicleNumber: req.body.vehicleNumber,
            fuelType: req.body.fuelType,
            ownership: req.body.ownership,
        };

        Vehicle.findOne({ id: req.params.id })
            .then((vehicle) => {
                if (vehicle) {
                    // Update the driver with the new data
                    Object.assign(vehicle, updatedVehicleData);
                    // Save the changes to the database
                    return vehicle.save();
                } else {
                    // Handle the case where the customer with the specified ID is not found
                    return res.status(422).render("admin/vehicles/add", {
                        pageTitle: 'Edit Vehicle',
                        path: `/vehicle/edit/${req.params.id}`,
                        errors: errors.array(),
                        vehicle: vehicle,
                        statuses: statuses,
                        status: selectStatus,
                        ownerships: ownerships,
                        ownership: selectOwnership,
                        carMakes: carMakes,
                        make: selectMake,
                        fuelTypes: fuelTypes,
                        fuelType: selectFuelType,
                        admin: req.session.user,
                        carTypes: carTypes,
                        carType: selectCarType,
                        errorMessage: false,
                        successMessage: false,
                        transformWord: customData.transformWord,
                        userInput: requestBody,
                        csrfToken: req.csrfToken()
                    });
                }
            })
            .then((updatedVehicle) => {
                // Handle the case where the update was successful
                return res.status(422).render("admin/vehicles/add", {
                    pageTitle: 'Edit Vehicle',
                    path: `/vehicle/edit/${req.params.id}`,
                    errors: errors.array(),
                    vehicle: updatedVehicle,
                    statuses: statuses,
                    status: selectStatus,
                    ownerships: ownerships,
                    ownership: selectOwnership,
                    carMakes: carMakes,
                    make: selectMake,
                    fuelTypes: fuelTypes,
                    fuelType: selectFuelType,
                    admin: req.session.user,
                    carTypes: carTypes,
                    carType: selectCarType,
                    errorMessage: false,
                    successMessage: "Vehicle updated successfully",
                    transformWord: customData.transformWord,
                    userInput: requestBody,
                    csrfToken: req.csrfToken()
                });
            })
            .catch((error) => {
                // Handle any errors that occurred during the update process
                console.error('Error updating user:', error.message);
                return res.status(422).render("admin/vehicles/add", {
                    pageTitle: 'Edit Vehicle',
                    path: `/vehicle/edit/${req.params.id}`,
                    errors: errors.array(),
                    vehicle: vehicle,
                    statuses: statuses,
                    status: selectStatus,
                    ownerships: ownerships,
                    ownership: selectOwnership,
                    carMakes: carMakes,
                    make: selectMake,
                    fuelTypes: fuelTypes,
                    fuelType: selectFuelType,
                    admin: req.session.user,
                    carTypes: carTypes,
                    carType: selectCarType,
                    errorMessage: "Error updating vehicle",
                    successMessage: false,
                    transformWord: customData.transformWord,
                    userInput: requestBody,
                    csrfToken: req.csrfToken()
                });
            });

    } catch (error) {
        return res.status(422).render("admin/vehicles/add", {
            pageTitle: 'Edit Vehicle',
            path: `/vehicle/edit/${req.params.id}`,
            errors: errors.array(),
            vehicle: vehicle,
            statuses: statuses,
            status: selectStatus,
            ownerships: ownerships,
            ownership: selectOwnership,
            carMakes: carMakes,
            make: selectMake,
            fuelTypes: fuelTypes,
            fuelType: selectFuelType,
            admin: req.session.user,
            carTypes: carTypes,
            carType: selectCarType,
            errorMessage: "Error updating vehicle",
            successMessage: false,
            transformWord: customData.transformWord,
            userInput: requestBody,
            csrfToken: req.csrfToken()
        });
    }
}

async function postDeleteVehicle(req, res) {
    const vehicle = await Vehicle.findOneAndDelete({ id: req.params.id });

    if (vehicle) {
        const vehicles = await Vehicle.find({}).sort({ _id: -1 });
        return res.status(422).render("admin/vehicles/list", {
            pageTitle: 'List Vehicles',
            path: `/vehicles`,
            errors: false,
            vehicle: false,
            vehicles: vehicles,
            statuses: statuses,
            status: false,
            ownerships: ownerships,
            ownership: false,
            carMakes: carMakes,
            make: false,
            fuelTypes: fuelTypes,
            fuelType: false,
            admin: req.session.user,
            carTypes: carTypes,
            carType: false,
            errorMessage: false,
            successMessage: 'Vehicle deleted successfully',
            transformWord: customData.transformWord,
            longDate: customData.longDate,
            userInput: false,
            csrfToken: req.csrfToken()
        });
    }
    const vehicle_1 = await Vehicle.find({}).sort({ _id: -1 });
    const vehicles_1 = await Vehicle.find({}).sort({ _id: -1 });
    return res.status(422).render("admin/vehicles/list", {
        pageTitle: 'List Vehicles',
        path: `/vehicles`,
        errors: false,
        vehicle: vehicle_1,
        vehicles: vehicles_1,
        statuses: statuses,
        status: false,
        ownerships: ownerships,
        ownership: false,
        carMakes: carMakes,
        make: false,
        fuelTypes: fuelTypes,
        fuelType: false,
        admin: req.session.user,
        carTypes: carTypes,
        carType: false,
        errorMessage: 'Vehicle could not be deleted',
        successMessage: false,
        longDate: customData.longDate,
        transformWord: customData.transformWord,
        userInput: false,
        csrfToken: req.csrfToken()
    });


}

/**vehicle assignment */
async function vehicleAssignment(req, res) {
    const message = req.query.q;
    const vehicles = await Vehicle.find({ assignedStatus: { $ne: 'Assigned' } });
    const operators = await Person.find({ category: 'Supervisor', assignedStatus: { $ne: 'Assigned' } });


    const assignments = await Assignment.find().populate('vehicle').populate('supervisor');

    try {
        return res.render('admin/vehicles/assignment', {
            pageTitle: 'Vehicle Assignments',
            path: '/vehicle/assignments',
            errors: false,
            assignment: false,
            vehicles: vehicles,
            vehicle: false,
            operators: operators,
            operator: false,
            assignments: assignments,
            userInput: false,
            admin: req.session.user,
            errorMessage: false,
            successMessage: message,
            cuteDate: customData.cuteDate,
            longDate: customData.longDate,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        return res.render('admin/vehicles/assignment', {
            pageTitle: 'Vehicle Assignments',
            path: '/vehicle/assignments',
            errors: true,
            assignment: false,
            vehicles: vehicles,
            vehicle: false,
            operators: operators,
            operator: false,
            assignments: assignments,
            userInput: false,
            admin: req.session.user,
            errorMessage: 'An error occurred',
            successMessage: false,
            shortData: customData.shortData,
            longDate: customData.longDate,
            csrfToken: req.csrfToken()
        });
    }
}
async function postVehicleAssignment(req, res) {
    const requestBody = req.body;
    const errors = validationResult(req);
    const vehicles = await Vehicle.find({ assignedStatus: { $ne: 'Assigned' } });
    const operators = await Person.find({ category: 'Supervisor', assignedStatus: { $ne: 'Assigned' } });
    const assignments = await Assignment.find({});

    if (!errors.isEmpty()) {
        console.log(errors)
        return res.render('admin/vehicles/assignment', {
            pageTitle: 'Vehicle Assignments',
            path: '/vehicle/assignments',
            errors: errors.array(),
            assignment: false,
            vehicles: vehicles,
            vehicle: false,
            operators: operators,
            operator: false,
            assignments: assignments,
            userInput: requestBody,
            admin: req.session.user,
            errorMessage: false,
            successMessage: false,
            cuteDate: customData.cuteDate,
            longDate: customData.longDate,
            csrfToken: req.csrfToken()
        });
    }

    try {
        const admin = req.session.user;

        const newAssignment = new Assignment({
            id: randId(),
            vehicle: req.body.vehicle,
            supervisor: req.body.supervisor,
            startDate: req.body.startDate,
            startTime: req.body.startTime,
            endDate: req.body.endDate,
            endTime: req.body.endTime,
            note: req.body.note,
            createdBy: admin._id,
        });

        const savedAssignment = await newAssignment.save();

        if (savedAssignment) {

            //mark vehicle as assigned
            await Vehicle.findOneAndUpdate({ _id: req.body.vehicle }, {
                assignedStatus: 'Assigned'
            });
            // mark driver as assigned
            await Person.findOneAndUpdate({ _id: req.body.supervisor }, {
                assignedStatus: 'Assigned'
            });

            return res.redirect('/vehicle/assignments?q=Vehicle assigned successfully');

        } else {

            const newVehicles = await Vehicle.find({ assignedStatus: { $ne: 'Assigned' } });
            res.render('admin/vehicles/assignment', {
                pageTitle: 'Vehicle Assignments',
                path: '/vehicle/assignments',
                errors: false,
                assignment: false,
                vehicles: newVehicles,
                vehicle: false,
                operators: operators,
                operator: false,
                assignments: assignments,
                userInput: requestBody,
                admin: req.session.user,
                errorMessage: 'Error assigning vehicle',
                successMessage: false,
                cuteDate: customData.cuteDate,
                longDate: customData.longDate,
                csrfToken: req.csrfToken()
            });
        }


    } catch (error) {
        console.log(error);
        res.status(422).render('admin/vehicles/assignment', {
            pageTitle: 'Vehicle Assignments',
            path: '/vehicle/assignments',
            errors: false,
            assignment: false,
            vehicles: vehicles,
            vehicle: false,
            operators: operators,
            operator: false,
            assignments: assignments,
            userInput: requestBody,
            admin: req.session.user,
            errorMessage: false,
            successMessage: false,
            cuteDate: customData.cuteDate,
            longDate: customData.longDate,
            csrfToken: req.csrfToken()
        });
    }

}

module.exports = {
    getAddVehicle,
    postAddVehicle,
    listVehicles,
    getEditVehicle,
    putEditVehicle,
    postDeleteVehicle,
    vehicleAssignment,
    postVehicleAssignment
};
