class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message
    }
}

const handleError = (err, res) => {
    let { statusCode, message } = err;
    if (!statusCode) statusCode = 500;
    if (!message) message = err.message;
    res.status(statusCode).json({
        status: "error",
        message
    });
};

module.exports = {
    ErrorHandler,
    handleError
}