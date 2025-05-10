import axios from 'axios';
import stringSimilarity from 'string-similarity';
import dotenv from 'dotenv';

dotenv.config()

const bvnToken = process.env.IDPASS
export const searchBVN = async (bvn: string) => {
  const url = 'https://idpass.com.ng/api/bvn-search2/';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Token ${bvnToken}`,
  };

  // Ensure the bvn variable is defined and valid
  if (!bvn || bvn.length !== 11) {
    console.error('Invalid BVN:', bvn);
    return;
  }

  try {
    // First attempt with "bvn"
    const response = await axios.post(url, { bvn }, { headers });
    console.log('BVN Search Success (bvn):', response.data);
    return response.data
  } catch (error) {
    console.warn('First attempt failed. Retrying with "idNumber"...');

    try {
      // Fallback attempt with "idNumber"
      const response = await axios.post(url, { idNumber: bvn }, { headers });
      console.log('BVN Search Success (idNumber):', response.data);
      return response.data
    } catch (fallbackError: any) {
      console.error('BVN Search Failed:', fallbackError.response?.data || fallbackError.message);
    }
  }
};

export const doesNameMatchBVN = (inputName: string, bvnData: any, threshold = 0.7): boolean => {
  const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');

  const input = normalize(inputName);

  const first = normalize(bvnData.firstName || '');
  const middle = normalize(bvnData.middleName || '');
  const last = normalize(bvnData.lastName || '');

  // All potential BVN name combinations
  const nameVariants = [
    `${first} ${last}`,
    `${first} ${middle} ${last}`,
    `${first} ${middle.charAt(0)} ${last}`, // middle initial
    `${first} ${last} ${middle}`,
    `${last} ${first}`,
    `${last} ${first} ${middle}`,
    `${first} ${middle}`, // sometimes middle & last are confused
    `${first}`,
    `${first} ${middle.charAt(0)}`, // partial middle
  ].map(normalize);

  const bestMatch = stringSimilarity.findBestMatch(input, nameVariants);
  console.log('Best match:', bestMatch.bestMatch);

  return bestMatch.bestMatch.rating >= threshold;
}