const moment = require("moment");

function shortDate(data) {
  return moment(data).format("ddd, MMM DD, YYYY, h:mm:ss a");
}

module.exports = {
  shortDate,
};
