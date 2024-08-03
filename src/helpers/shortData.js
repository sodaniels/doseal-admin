

const moment = require('moment');

function shortData(data) {
    return moment(data).format('ddd, MMM DD, YYYY');
}

function longDate(data) {
    return moment(data).format('ddd, MMM DD, YYYY HH:mm:ss');
}

function transformWord(str) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function cuteDate(data) {
    return moment(data).format('DD MMM, YYYY');
}



module.exports = {
    shortData,
    transformWord,
    longDate,
    cuteDate
};