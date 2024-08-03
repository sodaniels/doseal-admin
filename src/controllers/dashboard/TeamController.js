const Team = require('../../models/team.model');
const { shortData, longDate } = require('../../helpers/shortData');
const { Log } = require("../../helpers/Log");
const Person = require('../../models/person.model');
const { validationResult } = require("express-validator");


async function getListTeam(req, res) {
    const schedules = await Team.find({}).populate('supervisor').populate('driver').populate('collectors').populate('createdBy').sort({ _id: -1 });

    res.render('admin/teams/list', {
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

async function getTeam(req, res) {
    const message = req.query.q;
    const supervisors = await Person.find({ category: 'Supervisor', assignedStatus: 'Assigned', isJobAssigned: 'Unassigned' });
    const drivers = await Person.find({ category: 'Driver', assignedStatus: 'Unassigned' }); // change driver status to assisgned during the post
    const collectors = await Person.find({ category: 'Collector', assignedStatus: 'Unassigned' });

    res.render('admin/teams/add', {
        pageTitle: 'Add a team',
        path: '/Team/add',
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
        successMessage: message,
        csrfToken: req.csrfToken(),
    });
}

async function postTeam(req, res) {
    const errors = validationResult(req);
    const userInputBody = req.body;
    const supervisors = await Person.find({ category: 'Supervisor', assignedStatus: 'Assigned', isJobAssigned: 'Unassigned' }); // get a supervisor who has been assigned a vehicle and yet has not team
    const drivers = await Person.find({ category: 'Driver', assignedStatus: 'Unassigned' }); // change driver status to assisgned during the post
    const collectors = await Person.find({ category: 'Collector', assignedStatus: 'Unassigned' });

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/teams/add', {
            pageTitle: 'Add a team',
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
        const admin = req.session.user;
        const newTeam = new Team({
            name: req.body.name,
            startDate: req.body.startDate,
            startTime: req.body.startTime,
            endDate: req.body.endDate,
            endTime: req.body.endTime,
            supervisor: req.body.supervisor,
            driver: req.body.driver,
            collectors: req.body.collectors,
            createdBy: admin._id,
        });

        const savedTeam = await newTeam.save();

        if (savedTeam) {
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

            return res.redirect('/team/add?q=Team created successfully');


        }

        return res.status(422).render('admin/teams/add', {
            pageTitle: 'Add a team',
            path: '/team/add',
            errors: false,
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
    } catch (error) {
        return res.status(422).render('admin/teams/add', {
            pageTitle: 'Add a team',
            path: '/team/add',
            errors: false,
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
            errorMessage: error,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }
}

async function getEditTeam(req, res) {
    const successMessage = req.query.successMessage;
    const errorMessage = req.query.errorMessage;

    const supervisors = await Person.find({ category: 'Supervisor', assignedStatus: 'Assigned', isJobAssigned: 'Assigned' });
    const drivers = await Person.find({ category: 'Driver', assignedStatus: 'Assigned' });
    const collectors = await Person.find({ category: 'Collector', assignedStatus: 'Unassigned' });

    try {
        const schedule = await Team.findOne({ _id: req.params._id }).populate('supervisor').populate('driver').populate('collectors');


        if (schedule) {
            return res.render('admin/teams/add', {
                pageTitle: 'Edit a team',
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
                pageTitle: 'Edit a team',
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
            pageTitle: 'Edit a team',
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

async function putEditTeam(req, res) {
    const errors = validationResult(req);
    const admin = req.session.user;
    const userInputBody = req.body;

    const supervisors = await Person.find({ category: 'Supervisor', assignedStatus: 'Assigned', isJobAssigned: 'Assigned' });
    const drivers = await Person.find({ category: 'Driver', assignedStatus: 'Assigned' });
    const collectors = await Person.find({ category: 'Collector', assignedStatus: 'Unassigned' });

    const schedule = await Team.findOne({ _id: req.params._id });
    const collectorsIdsArray = schedule.collectors.map(person => person._id.toString());

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/teams/add', {
            pageTitle: 'Add a team',
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
        const updatedTeamData = {
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

        Team.findOne({ _id: req.params._id })
            .then((team) => {
                if (team) {
                    // Update the team with the new data
                    Object.assign(team, updatedTeamData);
                    // Save the changes to the database
                    return team.save();
                } else {
                    // Handle the case where the schedule with the specified ID is not found
                    res.redirect('team/list?message=Team not found')
                }
            })
            .then(async (updatedTeam) => {
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
                res.redirect(`../../team/edit/${updatedTeam._id}?successMessage=Team updated successfully`)
            })
            .catch((error) => {
                // Handle any errors that occurred during the update process
                console.error('Error updating user:', error.message);
                res.redirect(`../../team/edit/${req.params._id}?errorMessage=Team could not be updated`)
            });

    } catch (error) {
        res.redirect(`../../team/edit/${req.params._id}?errorMessage=Team could not be updated`)

    }
}

async function getViewTeam(req, res) {
    const _id = req.params._id
    try {
        const user = await Team.findOne({ _id }).populate('supervisor').populate('driver').populate('collectors').populate('createdBy');
        return res.render('admin/teams/view-team', {
            pageTitle: 'View Team',
            path: '/team/view/' + _id,
            user: user,
            admin: req.session.user,
            errors: false,
            errorMessage: false,
            successMessage: false,
            shortDate: shortData,
            longDate: longDate,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        return res.render('admin/teams/view-team', {
            pageTitle: 'View Team',
            path: '/team/view/' + _id,
            user: false,
            admin: req.session.user,
            errors: false,
            errorMessage: error,
            successMessage: false,
            shortDate: shortData,
            longDate: longDate,
            csrfToken: req.csrfToken()
        });
    }


    // return res.status(200).json(user)

}



module.exports = {
    getTeam,
    postTeam,
    getListTeam,
    getEditTeam,
    putEditTeam,
    getViewTeam,
};
