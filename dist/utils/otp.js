"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.sendOTP = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const apiKey = process.env.OTP_SECRET;
const emailConfig = process.env.EMAIL;
const sendOTP = async (phoneNumber) => {
    const data = {
        api_key: apiKey,
        message_type: "NUMERIC",
        to: phoneNumber,
        from: "Gbese",
        channel: "generic",
        pin_attempts: 10,
        pin_time_to_live: 5,
        pin_length: 5,
        pin_placeholder: "< 1234 >",
        message_text: "*DO NOT DISCLOSE* Your OTP Pin < 1234 >. This pin will expire in 5 mins.",
        pin_type: "NUMERIC"
    };
    try {
        const response = await axios_1.default.post('https://v3.api.termii.com/api/sms/otp/send', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.error('Error sending OTP:', error.response ? error.response.data : error.message);
    }
    return;
};
exports.sendOTP = sendOTP;
const verifyOTP = async (pinID, enteredPin) => {
    const data = {
        api_key: apiKey,
        pin_id: pinID,
        pin: enteredPin,
    };
    try {
        const response = await axios_1.default.post('https://v3.api.termii.com/api/sms/otp/verify', data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log(response.data);
        return { verified: response.data.verified };
    }
    catch (error) {
        console.error('Error verifying OTP:', error.response?.data || error.message);
    }
};
exports.verifyOTP = verifyOTP;
// export const sendEmail = async (email: string, userId: string) => {
//   const data = {
//     api_key: apiKey,
//     email_address: email,
//     code: `https://gbese.vercel.app/${userId}`,
//     email_configuration_id: emailConfig
//   };
//   axios.post('https://v3.api.termii.com/api/email/otp/send', data, {
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   })
//   .then(response => {
//     console.log(response.data);
//     return response.data
//   })
//   .catch(error => {
//     console.error(error);
//   });
// }
