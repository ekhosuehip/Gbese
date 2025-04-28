import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config()

const bvnToken = process.env.IDPASS
export const searchBVN = async (userBVN : string) => {
  try {
    const response = await axios.post(
      'https://idpass.com.ng/api/bvn-search2/',
      {
        bvn: userBVN
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${bvnToken}`
        }
      }
    );

    console.log('BVN Search Result:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error searching BVN:', error.response?.data || error.message);
  }
};
