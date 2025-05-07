"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
// Custom middleware for validating request body
function validate(schema) {
    return async (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.body, { abortEarly: false });
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            req.body = value;
            next();
        }
        catch (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}
