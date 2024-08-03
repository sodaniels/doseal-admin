const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error details for debugging

    // Set a default status code of 500 (Internal Server Error)
    let statusCode = res.statusCode || 500;

    // Customize the response based on the error type (optional)
    const error = {
        message: 'Internal Server Error',
    };

    // Handle specific errors (e.g., validation errors, resource not found)
    if (err.name === 'ValidationError') {
        statusCode = 400; // Bad Request
        error.message = 'Validation failed';
        error.errors = err.errors;
    } else if (err.status === 404) {
        statusCode = 404; // Not Found
        error.message = 'Resource not found';
    }

    // Send the error response to the client
    res.status(statusCode).send(error);
};

module.exports = errorHandler