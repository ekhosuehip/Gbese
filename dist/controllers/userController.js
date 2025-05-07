"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNonBeneficiatorUsers = void 0;
const userServices_1 = __importDefault(require("../services/userServices"));
const getNonBeneficiatorUsers = async (req, res, next) => {
    try {
        //To fetch all users from database
        const allUsers = await userServices_1.default.fetchAllUsers();
        //TO filter out those marked as benefitiators
        const nonBeneficiators = allUsers.filter(user => !user.isBeneficiator);
        res.status(200).json({
            success: true,
            message: "Non-beneficiator users fetched successfully",
            data: nonBeneficiators
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
exports.getNonBeneficiatorUsers = getNonBeneficiatorUsers;
