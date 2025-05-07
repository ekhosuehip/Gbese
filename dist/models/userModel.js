"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    phoneNumber: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    bvn: { type: String, unique: true, sparse: true, trim: true },
    isKycComplete: { type: Boolean, default: false },
    isBeneficiator: { type: Boolean, default: false } // ✅ NEW FIELD
}, { timestamps: true, versionKey: false });
const User = (0, mongoose_1.model)('User', userSchema);
exports.default = User;
