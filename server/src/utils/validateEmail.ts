const emailRegex = /\S+@\S+\.\S+/;

export const isValidEmail = (email: string) => emailRegex.test(email);
