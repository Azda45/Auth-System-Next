export const maskPhoneNumber = (phoneNumber: string): string => {
  if (phoneNumber.length <= 4) return phoneNumber; // Return original if too short
  const visibleDigits = 4; // Number of digits to show at the start and end
  const maskedPart = "*".repeat(phoneNumber.length - visibleDigits * 2);
  return (
    phoneNumber.slice(0, visibleDigits) +
    maskedPart +
    phoneNumber.slice(-visibleDigits)
  );
};
