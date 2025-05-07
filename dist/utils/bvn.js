"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBVN = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bvnToken = process.env.IDPASS;
const searchBVN = async (userBVN) => {
    try {
        const response = await axios_1.default.post('https://idpass.com.ng/api/bvn-search2/', {
            bvn: userBVN
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${bvnToken}`
            }
        });
        console.log('BVN Search Result:', response.data);
        return response.data;
    }
    catch (error) {
        console.error('Error searching BVN:', error.response?.data || error.message);
    }
};
exports.searchBVN = searchBVN;
