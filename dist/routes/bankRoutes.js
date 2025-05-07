"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const banksController_1 = require("../controllers/banksController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v3/banks/all:
 *   get:
 *     summary: Request to get all banks name and code
 *     tags:
 *       - Bank
 *     responses:
 *       200:
 *         description: Banks fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/banks/all', banksController_1.fetchAllBanks);
/**
 * @swagger
 * /api/v3/bank:
 *   get:
 *     summary: Request a specific bank by name
 *     tags:
 *       - Bank
 *     parameters:
 *       - in: query
 *         name: bank
 *         schema:
 *           type: string
 *         required: true
 *         description: Bank name to fetch
 *     responses:
 *       200:
 *         description: Bank fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get('/bank', banksController_1.fetchBank);
exports.default = router;
