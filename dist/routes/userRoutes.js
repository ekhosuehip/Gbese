"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Route: GET /api/v5/users/non-beneficiators
router.get('/non-beneficiators', authMiddleware_1.protect, userController_1.getNonBeneficiatorUsers);
exports.default = router;
