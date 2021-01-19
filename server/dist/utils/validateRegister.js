"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validateEmail_1 = require("./validateEmail");
const validateRegister = (options) => {
    if (!validateEmail_1.isValidEmail(options.email)) {
        return [
            {
                field: "email",
                message: "invalid email"
            }
        ];
    }
    if (options.username.length <= 3) {
        return [
            {
                field: "username",
                message: "username length must be greater than 3"
            }
        ];
    }
    if (validateEmail_1.isValidEmail(options.username)) {
        return [
            {
                field: "username",
                message: "username cannot be in form of email"
            }
        ];
    }
    if (options.password.length <= 3) {
        return [
            {
                field: "password",
                message: "password length must be greater than 3"
            }
        ];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map