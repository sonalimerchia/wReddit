import { Resolver, Mutation, Query, Arg, Ctx, InputType, Field, ObjectType, Int } from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => User, {nullable: true})
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  users (
    @Ctx() {em}: MyContext
  ): Promise<User[]> {
      return em.find(User, {});
  }

  @Query(() => User, {nullable: true})
  async me (
    @Ctx() {req, em}: MyContext
  ): Promise<User | null> {

    if(!req.session.userId) {
      return null; // not logged in
    }

    const user = await em.findOne(User, {id: req.session.userId});
    return user;
  }


  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em, req}: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 3) {
      return {
        errors: [
          {
            field: "username",
            message: "username length must be greater than 3"
          }
        ]
      }
    }
    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "password length must be greater than 3"
          }
        ]
      }
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username.toLowerCase(),
      password: hashedPassword
    });
    try {
      await em.persistAndFlush(user);
    } catch(err) {
      if (err.code = '23505' || err.detail.includes("already exists")) {
        return {
          errors: [{
            field: "username",
            message: "this username has already been taken"
          }]
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
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em, req}: MyContext
  ): Promise<UserResponse> {
    // Find username
    const user = await em.findOne(User, {username: options.username.toLowerCase()})
    if (!user) {
      return {
        errors: [{
          field: "username",
          message: "username does not exist"
        }]
      }
    }

    // Verify password
    const valid = await argon2.verify(user.password, options.password);
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
  async deleteUser(
    @Arg('id', () => Int) id:number,
    @Ctx() {em}: MyContext
  ): Promise<boolean> {
    await em.nativeDelete(User, {id});
    return true;
  }
}
