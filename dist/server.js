"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = __importDefault(require("./config/config"));
const phoneRoutes_1 = __importDefault(require("./routes/phoneRoutes"));
const bankRoutes_1 = __importDefault(require("./routes/bankRoutes"));
const authroutes_1 = __importDefault(require("./routes/authroutes"));
const debtRoutes_1 = __importDefault(require("./routes/debtRoutes"));
const paystackRoutes_1 = __importDefault(require("./routes/paystackRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const swagger_1 = require("./docs/swagger");
const redis_1 = require("./config/redis");
(async () => {
    await (0, redis_1.connectRedis)();
    const app = (0, express_1.default)();
    // Connect to MongoDB
    mongoose_1.default.connect(config_1.default.mongo.url)
        .then(() => console.log('Connected to Database'))
        .catch((error) => console.log('Database connection error', error));
    // Middleware
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.swaggerSpec));
    app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 'loopback');
    // Health check
    app.get('/api/health', (req, res) => {
        res.status(200).json({
            status: true,
            message: 'Server is running smoothly',
            environment: process.env.NODE_ENV || 'development'
        });
    });
    // Endpoints
    app.use('/api/v1', phoneRoutes_1.default);
    app.use('/api/v2', authroutes_1.default);
    app.use('/api/v3', bankRoutes_1.default);
    app.use('/api/v4', debtRoutes_1.default);
    app.use('/api/paystack', paystackRoutes_1.default);
    app.use('/api/v5', userRoutes_1.default);
    app.use((req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });
    app.listen(config_1.default.server.port, () => {
        console.log(`🚀 Server running on port ${config_1.default.server.port}`);
    });
})();
