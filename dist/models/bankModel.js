"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bankSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
}, { timestamps: false, versionKey: false, collection: 'bank' });
const Bank = (0, mongoose_1.model)('Bank', bankSchema);
exports.default = Bank;
