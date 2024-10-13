const winston = require("winston");
const { format, createLogger, transports } = winston;
const DailyRotateFile = require("winston-daily-rotate-file");
const fs = require("fs");
const path = require("path");

const getMonthWithLeadingZeros = () => {
	const month = new Date().getMonth() + 1; // Adding 1 since months are zero-based
	return month.toString().padStart(2, "0");
};

const logsFolder = path.join(__dirname, '../..', 'storage', 'logs');
if (!fs.existsSync(logsFolder)) {
  fs.mkdirSync(logsFolder, { recursive: true });
}

// Create a logger with a monthly rotating file transport
const Log = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console(), // Log to console for testing
    new DailyRotateFile({
      filename: 'log-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      dirname: path.join(__dirname, '../..', 'storage', 'logs', getMonthWithLeadingZeros()),
    }),
  ],
});


exports.Log = Log;
