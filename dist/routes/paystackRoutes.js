"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/paystackRoutes.ts
const express_1 = __importDefault(require("express"));
const paystackController_1 = require("../controllers/paystackController");
const router = express_1.default.Router();
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), paystackController_1.handlePaystackWebhook);
exports.default = router;
