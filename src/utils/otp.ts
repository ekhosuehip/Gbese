import dotenv from 'dotenv';
import axios from 'axios';
import {IOtp, IData, IVerify} from '../interfaces/phoneNumber'

dotenv.config();

const apiKey = process.env.OTP_SECRET

const emailConfig = process.env.EMAIL

export const sendOTP = async (phoneNumber: string): Promise<IOtp | void> => {
  const data: IData = {
    api_key: apiKey as string,
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
    const response = await axios.post('https://v3.api.termii.com/api/sms/otp/send', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(response.data);
    return response.data
  } catch (error: any) {
    console.error('Error sending OTP:', error.response ? error.response.data : error.message);
  }
  return;
};


export const verifyOTP = async (pinID: string, enteredPin: string): Promise<IVerify | void> => {
  const data = {
    api_key: apiKey,
    pin_id: pinID,
    pin: enteredPin,
  };

  try {
    const response = await axios.post('https://v3.api.termii.com/api/sms/otp/verify', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(response.data);
    return { verified: response.data.verified };
  } catch (error: any) {
    console.error('Error verifying OTP:', error.response?.data || error.message);
  }
};

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