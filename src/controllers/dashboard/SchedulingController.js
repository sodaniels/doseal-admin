const mongoose = require("mongoose");
const Schedule = require('../../models/schedule.model');
const Team = require('../../models/team.model');
const Dustbin = require('../../models/dustbin');
const AssignJob = require('../../models/assign-job.model');
const { shortData, longDate } = require('../../helpers/shortData');
const { Log } = require("../../helpers/Log");
const Person = require('../../models/person.model');
const { validationResult } = require("express-validator");
const {
    postEmail,
} = require("../../services/mailers/sendEmailService");
const ObjectId = mongoose.Types.ObjectId;


const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

let frequencies = ["One-time", "Daily", "Weekly", "Bi-weekly", "Monthly", "Customizable"];

async function getListScheduling(req, res) {
    const schedules = await Schedule.find({}).populate('team').populate('createdBy').sort({ _id: -1 });

    res.render('admin/schedulings/list', {
        pageTitle: 'List Teams',
        path: '/team/list',
        schedules: schedules,
        admin: req.session.user,
        errors: false,
        errorMessage: false,
        successMessage: false,
        shortDate: shortData,
        longDate: longDate,
        csrfToken: req.csrfToken()
    });
}

async function getListJobs(req, res) {

    const dustbins = await Dustbin.find({ status: 'INITIAL' }).populate('owner').populate('createdBy').sort({ _id: -1 });
    const teams = await Team.find({}).populate('supervisor').populate('driver').populate('collectors');

    res.render('admin/schedulings/job', {
        pageTitle: 'List Jobs',
        path: '/assign/job',
        dustbins: dustbins,
        admin: req.session.user,
        teams: teams,
        errors: false,
        errorMessage: false,
        successMessage: false,
        shortDate: shortData,
        longDate: longDate,
        csrfToken: req.csrfToken()
    });
}

async function postJobs(req, res) {
    const errors = validationResult(req);
    const teams = await Team.find({}).populate('supervisor').populate('driver').populate('collectors');
    const dustbins = await Dustbin.find({}).populate('owner').populate('createdBy').sort({ _id: -1 });

    if (!errors.isEmpty()) {
        return res.render('admin/schedulings/job', {
            pageTitle: 'List Jobs',
            path: '/assign/job',
            admin: req.session.user,
            dustbins: dustbins,
            teams: teams,
            errors: errors.array(),
            errorMessage: false,
            successMessage: false,
            shortDate: shortData,
            longDate: longDate,
            csrfToken: req.csrfToken()
        });
    }

    const ids = req.body.jobs;
    const selectedDustins = await Dustbin.find({ _id: { $in: ids } });

    const barcodes = selectedDustins.map(dustbin => dustbin.barcode);
    const addresses = selectedDustins.map(dustbin => dustbin.location.address);

    return res.render('admin/schedulings/job-team', {
        pageTitle: 'List Jobs with teams',
        path: '/assign/job/teams',
        admin: req.session.user,
        dustbins: dustbins,
        teams: teams,
        selectedJobs: JSON.stringify(req.body.jobs),
        barcodes: barcodes,
        addresses: addresses,
        errors: errors.array(),
        errorMessage: false,
        successMessage: false,
        shortDate: shortData,
        longDate: longDate,
        csrfToken: req.csrfToken()
    });


}

async function getListJobTeams(req, res) {

    const teams = await Team.find({}).populate('supervisor').populate('driver').populate('collectors');
    const dustbins = await Dustbin.find({ status: 'INITIAL' }).populate('owner').populate('createdBy').sort({ _id: -1 });


    res.render('admin/schedulings/job', {
        pageTitle: 'List Jobs',
        path: '/assign/job',
        admin: req.session.user,
        dustbins: dustbins,
        teams: teams,
        errors: false,
        selectedJobs: false,
        errorMessage: false,
        successMessage: false,
        shortDate: shortData,
        longDate: longDate,
        csrfToken: req.csrfToken()
    });
}

async function postJobTeams(req, res) {
    const errors = validationResult(req);
    const teams = await Team.find({}).populate('supervisor').populate('driver').populate('collectors');
    const dustbins = await Dustbin.find({ status: 'INITIAL' }).populate('owner').populate('createdBy').sort({ _id: -1 });
    const admin = req.session.user;

    if (!errors.isEmpty()) {
        return res.render('admin/schedulings/job', {
            pageTitle: 'List Jobs',
            path: '/assign/job/teams',
            admin: req.session.user,
            dustbins: dustbins,
            teams: teams,
            errors: errors.array(),
            errorMessage: false,
            successMessage: false,
            shortDate: shortData,
            longDate: longDate,
            csrfToken: req.csrfToken()
        });
    }

    const selectedJobs = req.body.jobs;
    const jobIds = JSON.parse(selectedJobs);
    const newJobs = jobIds.map(id => new ObjectId(id));

    const selectedTeams = req.body.teams;
    const newTeams = selectedTeams.map(id => new ObjectId(id));
    console.log(selectedTeams);

    const newAssignment = new AssignJob({
        job: newJobs,
        team: newTeams,
        assignedStatus: 'Assigned',
        createdBy: admin._id
    });

    const storeAssignments = await newAssignment.save();
    if (storeAssignments) {
        // update dustbins status
        newJobs.forEach(async (id) => {
            try {
                await Dustbin.findOneAndUpdate({ _id: id }, { status: "ASSIGNED" });
                console.log(`Dustbin with id ${id} updated successfully.`);

            } catch (error) {
                console.error(`Error updating dustbin with id ${id}: ${error}`);
            }
        });

        // for (const teamId of selectedTeams) {
        //     const team = Person.findOne({ _id: new ObjectId(teamId) });
        //     console.log('team: ' + team);
        //     try {
        //         Log.info(
        //             `[SchedulingController.js][postJobTeams]\t .. sending email to: ${team.email}`
        //         );
        //         const send = await postEmail(team.email);
        //         if (send) {
        //             Log.info(
        //                 `[SchedulingController.js][postJobTeams]\t .. email sent for`
        //             );
        //         }
        //     } catch (error) {
        //         Log.info(
        //             `[SchedulingController.js][postJobTeams]\t .. error sending email` + error
        //         );
        //     }
        // }


        return res.redirect('/assign/job')
    }
    return res.redirect('/assign/job')
}

async function getScheduling(req, res) {
    const successMessage = req.query.successMessage || undefined;
    const errorMessage = req.query.errorMessage || undefined;
    const teams = await Team.find({});

    res.render('admin/schedulings/add', {
        pageTitle: 'Add a schedule',
        path: '/schedule/add',
        errors: false,
        user: false,
        region: false,
        userInput: false,
        frequency: false,
        API_KEY: GOOGLE_API_KEY,
        frequencies: frequencies,
        team: false,
        teams: teams,
        schedule: false,
        admin: req.session.user,
        errorMessage: errorMessage,
        successMessage: successMessage,
        csrfToken: req.csrfToken(),
    });
}

async function getGoogleMap(req, res) {

    res.render('admin/schedulings/map', {
        pageTitle: 'Load Google Map',
        path: '/schedule/map',
        errors: false,
        API_KEY: GOOGLE_API_KEY,
        admin: req.session.user,
        errorMessage: false,
        successMessage: false,
        csrfToken: req.csrfToken(),
    });
}


async function postScheduling(req, res) {
    const errors = validationResult(req);
    const userInputBody = req.body;

    const admin = req.session.user;
    const teams = await Team.find({});
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/schedulings/add', {
            pageTitle: 'Add a schedule',
            path: '/schedule/add',
            errors: false,
            user: false,
            region: false,
            userInput: false,
            frequency: false,
            frequencies: frequencies,
            locations: false,
            location: false,
            team: false,
            teams: teams,
            schedule: false,
            admin: req.session.user,
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }

    try {
        const locationData = req.body.hiddenLocation;
        const parsedData = locationData.map(jsonString => JSON.parse(jsonString));

        const admin = req.session.user;
        const newSchedule = new Schedule({
            title: req.body.title,
            startDate: req.body.startDate,
            frequency: req.body.frequency,
            team: req.body.team,
            description: req.body.description,
            location: parsedData,
            createdBy: admin._id,
        });

        const savedSchedule = await newSchedule.save();

        if (savedSchedule) {
            return res.redirect('/schedule/add?successMessage=Schedule created successfully');
        } else {
            return res.redirect('/schedule/add?errorMessage=Schedule could not be created');
        }
    } catch (error) {
        return res.redirect(`/schedule/add?errorMessage=${error}`);
    }
}

async function getEditScheduling(req, res) {
    const successMessage = req.query.successMessage;
    const errorMessage = req.query.errorMessage;

    const supervisors = await Person.find({ category: 'Supervisor', assignedStatus: 'Assigned', isJobAssigned: 'Assigned' });
    const drivers = await Person.find({ category: 'Driver', assignedStatus: 'Assigned' });
    const collectors = await Person.find({ category: 'Collector', assignedStatus: 'Unassigned' });

    try {
        const schedule = await Schedule.findOne({ _id: req.params._id }).populate('supervisor').populate('driver').populate('collectors');


        if (schedule) {
            return res.render('admin/teams/add', {
                pageTitle: 'Edit a schedule',
                path: '/team/edit',
                errors: false,
                user: false,
                region: false,
                userInput: false,
                supervisors: supervisors,
                supervisor: schedule ? schedule.supervisor._id : false,
                drivers: drivers,
                driver: schedule ? schedule.driver._id : false,
                schedule: schedule,
                collectors: collectors,
                collector: false,
                admin: req.session.user,
                errorMessage: errorMessage ? errorMessage : false,
                successMessage: successMessage ? successMessage : false,
                csrfToken: req.csrfToken(),
            });
        } else {
            return res.render('admin/teams/add', {
                pageTitle: 'Edit a schedule',
                path: '/team/edit',
                errors: false,
                user: false,
                region: false,
                userInput: false,
                supervisors: supervisors,
                supervisor: false,
                drivers: drivers,
                driver: false,
                schedule: false,
                collectors: collectors,
                collector: false,
                admin: req.session.user,
                errorMessage: false,
                successMessage: false,
                csrfToken: req.csrfToken(),
            });
        }
    } catch (error) {
        return res.render('admin/teams/add', {
            pageTitle: 'Edit a schedule',
            path: '/team/edit',
            errors: false,
            user: false,
            region: false,
            userInput: false,
            supervisors: supervisors,
            supervisor: false,
            drivers: drivers,
            driver: false,
            schedule: false,
            collectors: collectors,
            collector: false,
            admin: req.session.user,
            errorMessage: error,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }


}

async function putEditScheduling(req, res) {
    const errors = validationResult(req);
    const admin = req.session.user;
    const userInputBody = req.body;

    const supervisors = await Person.find({ category: 'Supervisor', assignedStatus: 'Assigned', isJobAssigned: 'Assigned' });
    const drivers = await Person.find({ category: 'Driver', assignedStatus: 'Assigned' });
    const collectors = await Person.find({ category: 'Collector', assignedStatus: 'Unassigned' });

    const schedule = await Schedule.findOne({ _id: req.params._id });
    const collectorsIdsArray = schedule.collectors.map(person => person._id.toString());

    /**finialize edit schedule by updating collectors when some are added or removed. */
    // const schedule = await Schedule.findOne({ _id: req.params._id });
    // const collectorsIdsArray = collectors.map(person => person._id.toString());
    // console.log('old: ' + JSON.stringify(collectorsIdsArray));
    // console.log('new: ' + JSON.stringify(req.body.collectors));

    // const newCollectors = req.body.collectors.filter(collector => !collectorsIdsArray.includes(collector));

    // console.log(newCollectors)


    if (!errors.isEmpty()) {
        return res.status(422).render('admin/teams/add', {
            pageTitle: 'Add a schedule',
            path: '/team/add',
            errors: errors.array(),
            user: false,
            region: false,
            userInput: userInputBody,
            supervisors: supervisors,
            supervisor: false,
            drivers: drivers,
            driver: false,
            schedule: false,
            collectors: collectors,
            collector: false,
            admin: req.session.user,
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }

    try {
        const updatedScheduleData = {
            title: req.body.title,
            startDate: req.body.startDate,
            startTime: req.body.startTime,
            endDate: req.body.endDate,
            endTime: req.body.endTime,
            supervisor: req.body.supervisor,
            driver: req.body.driver,
            collectors: req.body.collectors,
            createdBy: admin._id,
        };

        Schedule.findOne({ _id: req.params._id })
            .then((schedule) => {
                if (schedule) {
                    // Update the schedule with the new data
                    Object.assign(schedule, updatedScheduleData);
                    // Save the changes to the database
                    return schedule.save();
                } else {
                    // Handle the case where the schedule with the specified ID is not found
                    res.redirect('team/list?message=Schedule not found')
                }
            })
            .then(async (updatedSchedule) => {
                // update supervisor
                await Person.findOneAndUpdate(
                    { _id: req.body.supervisor },
                    {
                        isJobAssigned: 'Assigned',
                    });
                // update driver
                await Person.findOneAndUpdate(
                    { _id: req.body.driver },
                    {
                        assignedStatus: 'Assigned',
                    });
                // update collector
                for (const collector of req.body.collectors) {
                    await Person.findOneAndUpdate(
                        { _id: collector },
                        {
                            assignedStatus: 'Assigned',
                        });
                }
                // Handle the case where the update was successful
                res.redirect(`../../team/edit/${updatedSchedule._id}?successMessage=Schedule updated successfully`)
            })
            .catch((error) => {
                // Handle any errors that occurred during the update process
                console.error('Error updating user:', error.message);
                res.redirect(`../../team/edit/${req.params._id}?errorMessage=Schedule could not be updated`)
            });

    } catch (error) {
        res.redirect(`../../team/edit/${req.params._id}?errorMessage=Schedule could not be updated`)

    }
}

async function getJobList(req, res) {

    const jobs = await AssignJob.find({ assignedStatus: 'Assigned' }).populate('job').populate('team').populate('createdBy');

    return res.render('admin/jobs/list', {
        pageTitle: 'Job List',
        path: '/jobs/list',
        jobs: jobs,
        admin: req.session.user,
        errors: false,
        errorMessage: false,
        successMessage: false,
        shortDate: shortData,
        longDate: longDate,
        csrfToken: req.csrfToken()
    });
}

async function getQrCodeSorting(req, res) {

    res.render('admin/jobs/sort-qr', {
        pageTitle: 'Sort Qr Code',
        path: '/sort/qr-code',
        errors: false,
        dustbins: false,
        admin: req.session.user,
        userInput: false,
        searchResults: false,
        errorMessage: false,
        successMessage: false,
        shortDate: shortData,
        longDate: longDate,
        csrfToken: req.csrfToken()
    });
}

async function postQrCodeSorting(req, res) {
    const errors = validationResult(req);
    const userInputBody = req.body;
    if (!errors.isEmpty()) {
        res.render('admin/jobs/sort-qr', {
            pageTitle: 'Sort Qr Code',
            path: '/sort/qr-code',
            errors: errors.array(),
            dustbins: false,
            dustbinsIds: false,
            admin: req.session.user,
            userInput: userInputBody,
            searchResults: false,
            errorMessage: false,
            successMessage: false,
            shortDate: shortData,
            longDate: longDate,
            csrfToken: req.csrfToken()
        });
    }

    try {

        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);

        endDate.setHours(23, 59, 59, 999);

        const dustbins = await Dustbin.find({
            status: 'ASSIGNED',
            createdAt: { $gte: startDate, $lte: endDate },
        })
            .sort({ createdAt: -1 })
            .populate('owner')
            .populate('createdBy');

        const _dustbinsIds = await Dustbin.find({
            status: 'ASSIGNED',
            createdAt: { $gte: startDate, $lte: endDate },
        })
            .sort({ createdAt: -1 })
            .select('_id')

            const dustbinsIds = _dustbinsIds.map(dustbin => dustbin._id);


        if (dustbins.length > 0) {
            res.render('admin/jobs/sort-qr', {
                pageTitle: 'Sort Qr Code',
                path: '/sort/qr-code',
                errors: false,
                dustbins: dustbins,
                dustbinsIds: dustbinsIds,
                admin: req.session.user,
                userInput: userInputBody,
                searchResults: true,
                errorMessage: false,
                successMessage: false,
                shortDate: shortData,
                longDate: longDate,
                csrfToken: req.csrfToken()
            });
        } else {
            res.render('admin/jobs/sort-qr', {
                pageTitle: 'Sort Qr Code',
                path: '/sort/qr-code',
                errors: false,
                dustbins: [],
                dustbinsIds: false,
                admin: req.session.user,
                userInput: userInputBody,
                searchResults: true,
                errorMessage: false,
                successMessage: false,
                shortDate: shortData,
                longDate: longDate,
                csrfToken: req.csrfToken()
            });
        }

    } catch (error) {
        res.render('admin/jobs/sort-qr', {
            pageTitle: 'Sort Qr Code',
            path: '/sort/qr-code',
            errors: false,
            dustbins: false,
            dustbinsIds: false,
            admin: req.session.user,
            userInput: userInputBody,
            searchResults: false,
            errorMessage: error,
            successMessage: false,
            shortDate: shortData,
            longDate: longDate,
            csrfToken: req.csrfToken()
        });
    }
}

async function postQrCodePreview(req, res) {
    const userInputBody = req.body.dustbins;


    const idsArray = userInputBody.split(',');
    const objectIds = idsArray.map(id => new ObjectId(id));

    const dustbinData = await Dustbin.find({
        _id: { $in: objectIds }
    }).populate('owner');

    // return res.status(200).json(dustbinData);
    

    if (userInputBody.length > 0) {
        res.render('admin/jobs/sort-qr-preview', {
            pageTitle: 'Qr Code Preview',
            path: '/sort/qr-code/preview',
            errors: false,
            dustbinData: dustbinData,
            admin: req.session.user,
            userInput: false,
            searchResults: true,
            errorMessage: false,
            successMessage: false,
            shortDate: shortData,
            longDate: longDate,
            csrfToken: req.csrfToken()
        });
    } else {
        res.render('admin/jobs/sort-qr', {
            pageTitle: 'Sort Qr Code',
            path: '/sort/qr-code',
            errors: false,
            dustbins: [],
            admin: req.session.user,
            userInput: false,
            searchResults: true,
            errorMessage: false,
            successMessage: false,
            shortDate: shortData,
            longDate: longDate,
            csrfToken: req.csrfToken()
        });
    }
}



module.exports = {
    getScheduling,
    postScheduling,
    getListScheduling,
    getEditScheduling,
    putEditScheduling,
    getGoogleMap,
    getListJobs,
    getListJobTeams,
    postJobs,
    postJobTeams,
    getJobList,
    getQrCodeSorting,
    postQrCodeSorting,
    postQrCodePreview,
};
