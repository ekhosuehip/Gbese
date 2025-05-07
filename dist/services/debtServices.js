"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debtModel_1 = __importDefault(require("../models/debtModel"));
class DebtService {
    // Create debt
    async createDebt(data) {
        return await debtModel_1.default.create(data);
    }
    // Fetch debt 
    async fetchDebt(id) {
        return debtModel_1.default.findById(id);
    }
    //Update debt date
    async updateDebt(id, date) {
        return await debtModel_1.default.findByIdAndUpdate(id, date, { new: true });
    }
    //merketplace
    async fetchListedDebt() {
        return await debtModel_1.default.find({
            isListed: true,
            isCleared: false
        }).sort({ dueDate: 1 }).populate("user");
    }
}
const debtService = new DebtService;
exports.default = debtService;
