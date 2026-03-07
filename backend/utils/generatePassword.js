import crypto from "crypto";

export const generateRandomPassword = () => {
    return crypto.randomBytes(8).toString("hex"); //16 char password
};

//generate a random meeting code of specified length (default 8 characters)
export const generateMeetingCode = (length = 8) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
};