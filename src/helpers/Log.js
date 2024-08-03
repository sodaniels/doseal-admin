const winston = require("winston");
const { format } = winston;
const { combine, timestamp, printf } = format;

const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
const day = String(currentDate.getDate()).padStart(2, "0");

const formattedDate = `${year}-${month}-${day}`;

const createFileTransports = (logLevels) => {
	return logLevels.map((logLevel) => {
		return new winston.transports.File({
			filename: `storage/logs/${logLevel}/log-${formattedDate}.log`,
			datePattern: "YYYY-MM-DD",
			level: logLevel,
		});
	});
};

const Log = winston.createLogger({
	format: combine(
		timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		printf(({ level, message, timestamp }) => {
			return `[${timestamp}] ${level}: ${message}`;
		})
	),
	transports: [
		new winston.transports.Console(),
		...createFileTransports(["debug", "error"]),
	],
});

exports.Log = Log;
