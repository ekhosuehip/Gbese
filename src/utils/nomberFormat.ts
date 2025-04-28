export const formatPhoneNumber = (phoneNumber: string): string => {
  // Check if phoneNumber is defined and not empty
  if (!phoneNumber) {
    throw new Error("Phone number is required and cannot be empty");
  }

  // Log the phone number to see what value is being passed
  console.log('Received phoneNumber:', phoneNumber);

  // Remove any non-numeric characters (e.g., spaces, dashes)
  const cleanNumber = phoneNumber.replace(/\D/g, "");

  // Check if the number starts with '0' (local format)
  if (cleanNumber.startsWith('0')) {
    // Replace the leading '0' with '234' (Nigeria's international dialing code)
    return '234' + cleanNumber.slice(1);
  }

  // If it's already in international format (starts with '234')
  return cleanNumber.startsWith('234') ? cleanNumber : `234${cleanNumber}`;
};
