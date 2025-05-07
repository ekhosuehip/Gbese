"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.client = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = require("redis");
dotenv_1.default.config();
const client = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
exports.client = client;
client.on('error', function (err) {
    console.error('Redis Client Error:', err);
});
const connectRedis = async () => {
    try {
        await client.connect();
        console.log('🚀 Redis connected successfully');
    }
    catch (error) {
        console.error('Redis connection error:', error);
    }
};
exports.connectRedis = connectRedis;
