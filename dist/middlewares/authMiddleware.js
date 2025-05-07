"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secretKey = process.env.JWT_SECRET;
const protect = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    console.log("Extracted Token:", token);
    if (!token) {
        res.status(401).json({ success: false, message: "Unauthorized. Token not provided." });
        console.log("no tokenfound");
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        if (!decoded) {
            res.status(401).json({ success: false, message: "Invalid token." });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: "token verification failed." });
    }
};
exports.protect = protect;
