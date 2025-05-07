"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bankModel_1 = __importDefault(require("../models/bankModel"));
class BanksService {
    // Fetch all banks
    async fetchAllBanks() {
        return await bankModel_1.default.find({}, { _id: 0 });
    }
    // Fetch specific bank
    async fetchBank(bankName) {
        return await bankModel_1.default.findOne({ name: bankName }, { _id: 0 });
    }
}
;
const banksServices = new BanksService;
exports.default = banksServices;
