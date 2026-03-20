const errorHandler = (err, req, res, next) => {
    console.error('[SERVER ERROR]', err); // Log to terminal
    const statusCode = res.statusCode ? res.statusCode : 500;

    res.status(statusCode);

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    errorHandler,
};
