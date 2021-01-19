"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = void 0;
const emailRegex = /\S+@\S+\.\S+/;
const isValidEmail = (email) => emailRegex.test(email);
exports.isValidEmail = isValidEmail;
//# sourceMappingURL=validateEmail.js.map