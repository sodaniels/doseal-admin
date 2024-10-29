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
const csrf = require('@dr.pogodin/csurf')


const websiteRoutes = require("./routes/web/website.route");
const { Log } = require("./helpers/Log");

const router = express.Router();
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

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

app.use("/", websiteRoutes);


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
