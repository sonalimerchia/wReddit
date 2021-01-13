import { Resolver, Query, Ctx } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {

  // posts() will return an array of Posts
  @Query(() => [Post])
  posts(
    @Ctx() {em}: MyContext
  ) {
      return em.find(Post, {});
  }
}
