const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
const passport = require("passport");
const cors = require("cors");
const helmet = require("helmet");

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
const deviceRoutes = require("./routes/dashboard/device.route");
const transactionRoutes = require("./routes/dashboard/transaction.route");

const authGeneralRoutes = require("./routes/auth-general/auth.route");

const subscriberRoutes = require("./routes/whatsapp/subscriber");

const oauthSetting = require("./helpers/security/oauth");
const oauth2Whatsapp = require("./helpers/security/oauth2-whatsapp");

const { connectAndStartCron } = require("./CRONS/cronJobs.crons");
connectAndStartCron();

const apiRoutes = require("./routes/mp/api.route");
const internalApiRoutes = require("./routes/mp/internal-api.route");
const externalApiRoutes = require("./routes/mp/external-api.route");
const callbackRoutes = require("./routes/mp/callback.route");

const passportJwt = require("./helpers/passport-jwt");

const isAuth = require("./Middleware/is-auth");
const errorHandler = require("./Middleware/errorMiddleware");
const { Log } = require("./helpers/Log");
const ensureAuthenticated = require("./Middleware/ensureAuthenticated");

const router = express.Router();
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
// Tell Express to trust the reverse proxy
app.set("trust proxy", 1);

/**helmet configuration */
app.use(cors());
app.use(helmet());
app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.hidePoweredBy());
app.use(
	helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true })
);
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));
app.use((req, res, next) => {
	res.setHeader(
		"Content-Security-Policy",
		"script-src 'self' https://www.google.com/recaptcha/api.js https://www.gstatic.com"
	);
	next();
});
app.use(helmet.xssFilter());
app.use(cors({ origin: "https://unity.doseal.org" })); // Replace with your app's URL
/**helmet configuration */

app.use(express.static(path.join(__dirname, "public")));

const sessionStore = new MongoDBStore({
	uri: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
	collection: "sessions",
});

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

app.use("/api/v1/", callbackRoutes);

app.use("/auth/", authApiRoutes);

app.use(oauthSetting);

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

app.use(oauth2Whatsapp);
/** Whatsapp routes */
app.use(
	"/api/v1",
	passport.authenticate("jwt", { session: false }),
	subscriberRoutes
);

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, PATCH, DELETE"
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	next();
});

const csrfProtection = csrf();
app.use(csrfProtection);

app.use("/", authRoutes);

app.use("/", authGeneralRoutes);

app.use(isAuth);

// device routes
app.use("/", deviceRoutes);

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

//transactions routes
app.use("/", transactionRoutes);

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


