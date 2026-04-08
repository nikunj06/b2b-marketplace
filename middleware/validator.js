// middleware/validator.js

function validateBody(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            const err = new Error(errorMessage);
            err.status = 400; // Bad Request
            return next(err);
        }
        next();
    };
}

module.exports = { validateBody };
