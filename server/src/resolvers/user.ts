import { Resolver, Mutation, Query, Arg, Ctx} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import {COOKIE_NAME, FRONTEND_URL, FORGET_PASSWORD_PREFIX} from "../constants";
import {isValidEmail} from "../utils/validateEmail";
import {sendEmail} from "../utils/sendEmail";
import {validateRegister, validatePassword} from "../utils/validateRegister";
import argon2 from "argon2";
import {UsernamePasswordInput} from "../objecttypes/UsernamePasswordInput";
import {UserResponse} from "../objecttypes/UserResponse";
import {v4} from "uuid";

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() {req, redis}: MyContext
  ): Promise<UserResponse> {
    const key = FORGET_PASSWORD_PREFIX+token;
    const userIdStr = await redis.get(key);
    if (!userIdStr) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired"
          }
        ]
      };
    }

    const userId = parseInt(userIdStr);
    const validationErrors = validatePassword(newPassword);
    if (validationErrors) {
      return {
        errors: validationErrors
      };
    }

    const user = await User.findOne(userId);
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists"
          }
        ]
      };
    }

    await User.update(
      {  id: userId },
      {
        password: await argon2.hash(newPassword)
      }
    );

    redis.del(key);
    req.session.userId = userId;

    return {
      user: user
    };
  }

  @Mutation(() => Boolean)
  async forgotPassword (
    @Arg('email') email: string,
    @Ctx() {redis}: MyContext
  ) {
    const user = await User.findOne({where: {email: email.toLowerCase()} });
    if (!user) {
      return true;
    }

    const token = v4();
    await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3); // 3 days
    const link = FRONTEND_URL + '/change-password/' + token;

    await sendEmail(email, "Reset Password", `<a href="${link}">reset password</a>`);
    return true;
  }


  @Query(() => [User])
  users(): Promise<User[]> {
      return User.find();
  }

  @Query(() => User, {nullable: true})
  me (@Ctx() {req}: MyContext) {
    if(!req.session.userId) {
      return null; // not logged in
    }
    return User.findOne(req.session.userId);
  }


  @Mutation(() => UserResponse)
  async register(
   @Arg('options') options: UsernamePasswordInput,
   @Ctx() {req}: MyContext
  ): Promise<UserResponse> {

    const validationErrors = validateRegister(options);
    if (validationErrors) {
      return {errors: validationErrors};
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = User.create({
        username: options.username.toLowerCase(),
        email: options.email.toLowerCase(),
        password: hashedPassword
      });

    try {
      user.save();
    } catch(err) {
      console.log("err: ", err);
      if (err.code = '23505') {
        if (err.constraint === 'user_email_unique') {
          return {
            errors: [
              {
                field: "email",
                message: "this email already has an account"
              }
            ]
          };
        } else {
          return {
            errors: [
              {
                field: "username",
                message: "this username is taken"
              }
            ]
          };
        }
      }
    }

    // Set a cookie on the user and keep them logged in
    req.session.userId = user.id;

    return {
      user: user
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() {req}: MyContext
  ): Promise<UserResponse> {
    // Find username
    const user = await User.findOne(
      isValidEmail(usernameOrEmail)
      ? {where: {email: usernameOrEmail.toLowerCase()}}
      : {where: {username: usernameOrEmail.toLowerCase()}}
    );

    if (!user) {
      return {
        errors: [{
          field: "usernameOrEmail",
          message: "username does not exist"
        }]
      }
    }

    // Verify password
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [{
          field: "password",
          message: "incorrect password"
        }]
      }
    }

    // Set a cookie on the user and keep them logged in
    req.session.userId = user.id;

    return {
      user: user
    }
  }

  @Mutation(() => Boolean)
  async deleteUser(@Arg('id') id:number): Promise<boolean> {
    await User.delete(id);
    return true;
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() {req, res}: MyContext
  ) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
