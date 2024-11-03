const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
const passport = require("passport");

const session = require("express-session");
const flash = require("express-flash");
const MongoDBStore = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");
const csrf = require("@dr.pogodin/csurf");

const dashboardRoutes = require("./routes/dashboard/dashboard.route");
const authRoutes = require("./routes/dashboard/auth.route");
const usersRoutes = require("./routes/dashboard/users.route");
const onboardingRoutes = require("./routes/dashboard/onboarding.route");
const regionRoutes = require("./routes/dashboard/region.route");
const personRoutes = require("./routes/dashboard/person.route");
const vehicleRoutes = require("./routes/dashboard/vehicle.route");
const schedulingRoutes = require("./routes/dashboard/scheduling.route");
const teamRoutes = require("./routes/dashboard/team.route");
const divisionRoutes = require("./routes/dashboard/division.route");
const expensesRoutes = require("./routes/dashboard/expense.route");
const vendorRoutes = require("./routes/dashboard/vendor.route");
const authApiRoutes = require("./routes/mp/authApi.route");
const deskDeskRoutes = require("./routes/dashboard/help-desk.route");
const newsRoomRoutes = require("./routes/dashboard/news-room.route");
const notificationRoutes = require("./routes/dashboard/notification.route");

const { connectAndStartCron } = require("./CRONS/cronJobs.crons");
connectAndStartCron();

const apiRoutes = require("./routes/mp/api.route");
const internalApiRoutes = require("./routes/mp/internal-api.route");
const externalApiRoutes = require("./routes/mp/external-api.route");
const callbackRoutes = require("./routes/mp/callback.route");
const isWhitelisted = require("./Middleware/is-whitelisted-IP");

const passportJwt = require("./helpers/passport-jwt");

const isAuth = require("./Middleware/is-auth");
const errorHandler = require("./Middleware/errorMiddleware");
const { Log } = require("./helpers/Log");
const ensureAuthenticated = require("./Middleware/ensureAuthenticated");

const router = express.Router();
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.set('trust proxy', true);

app.use(express.static(path.join(__dirname, "public")));

const sessionStore = new MongoDBStore({
	uri: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
	collection: "sessions",
});

const csrfProtection = csrf();

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		store: sessionStore,
		// cookie: { secure: process.env.ENVIRONMENT === 'development' ? false : true }
	})
);

// Set up flash messages
app.use(flash());

// Auto logout middleware
app.use((req, res, next) => {
	const maxInactiveTime = 120 * 60 * 1000; // 15 minutes in milliseconds
	if (
		req.session.lastActive &&
		Date.now() - req.session.lastActive > maxInactiveTime
	) {
		// If user has been inactive for too long, destroy the session and log them out
		req.session.destroy((err) => {
			if (err) {
				Log.info("Error destroying session:", err);
			}
			res.redirect("/login"); // Redirect to login page after logout
		});
	} else {
		req.session.lastActive = Date.now(); // Update last active time
		next(); // Move to next middleware
	}
});

app.use("/auth/", authApiRoutes);

app.use(
	"/api/v1/",
	passportJwt.authenticate("jwt", { session: false }),
	apiRoutes
);

app.use(
	"/api/v1/",
	passportJwt.authenticate("jwt", { session: false }),
	internalApiRoutes
);
app.use(
	"/api/v1/",
	passportJwt.authenticate("jwt", { session: false }),
	externalApiRoutes
);
app.use("/", newsRoomRoutes);
app.use("/", expensesRoutes);

app.use(csrfProtection);

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, PATCH, DELETE"
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	next();
});

app.use("/", authRoutes);

app.use(isAuth);

app.use("/", usersRoutes);

app.use("/", dashboardRoutes);

app.use("/", onboardingRoutes);

app.use("/", regionRoutes);

app.use("/", personRoutes);

app.use("/", vehicleRoutes);

app.use("/", schedulingRoutes);

app.use("/", teamRoutes);

app.use("/", divisionRoutes);

app.use("/", vendorRoutes);

app.use("/", deskDeskRoutes);

app.use("/", notificationRoutes);

app.use("/api/v1/", isWhitelisted, callbackRoutes);

// error handling middleware
app.use(errorHandler);

mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
	)
	.then((result) => {
		const server = app.listen(process.env.APP_PORT);
		if (server) {
			console.log("Connected to MongoDB");
			console.log(`Server running on port ${process.env.APP_PORT}`);
		}

		const io = require("../socket").init(server);

		io.on("connection", (socket) => {
			console.log("Socket io client connected");
		});
	})
	.catch((err) => {
		console.log(err);
	});
