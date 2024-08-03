const { body } = require('express-validator');
const { validationResult } = require('express-validator');

// Custom validation middleware to check if the field is in the format "latitude,longitude"
const validateLatLngFormat = (value, { req }) => {
  const location = value;
  const latLngRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;

  if (!latLngRegex.test(location)) {
    throw new Error('Invalid latitude,longitude format');
  }

  return true;
};

module.exports = {
  validateLatLngFormat,
};