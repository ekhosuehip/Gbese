"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SERVER_PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.MONGO;
const config = {
    mongo: {
        url: DATABASE_URL
    },
    server: {
        port: SERVER_PORT
    }
};
exports.default = config;
