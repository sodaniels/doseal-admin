const passportJwt = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/user");
require("dotenv").config();

// JWT options for passport-jwt strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_TOKEN,
};

// JWT strategy to validate the token
passportJwt.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
        try {
            const { _id } = jwtPayload;

            // Find the user based on the clientId and clientSecret from the decoded token
            const user = await User.findOne(
                { _id: _id }).select('firstName middleName  lastName phoneNumber email  idType idNumber idExpiryDate');
            if (user) {
                // Valid token and valid user found, pass the user object to the next middleware
                return done(null, user);
            } else {
                // Invalid client credentials
                return done(null, false, {
                    code: 403,
                    message: "Invalid client credentials",
                });
            }
        } catch (error) {
            return done(error);
        }
    })
);



module.exports = passportJwt;