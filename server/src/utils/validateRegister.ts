import {UsernamePasswordInput} from "../objecttypes/UsernamePasswordInput";
import {isValidEmail} from "./validateEmail";

export const validateRegister = (options : UsernamePasswordInput) => {
  if (!isValidEmail(options.email)) {
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

  if (isValidEmail(options.username)) {
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
}
