// middleware/errorHandler.js

function errorHandler(err, req, res, next) {
    console.error('Error Handling Middleware:', err);

    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message: message
    });
}

module.exports = errorHandler;
