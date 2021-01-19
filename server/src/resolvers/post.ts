import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {

  // posts() will return an array of Posts
  @Query(() => [Post])
  posts(): Promise<Post[]> {
      return Post.find();
  }

  @Query(() => Post, {nullable: true})
  post(@Arg('id') id:number): Promise<Post | undefined> {
      return Post.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(@Arg('title') title: string): Promise<Post> {
    // 2 sql queries (create/get)
    return Post.create({title: title}).save();
  }

  @Mutation(() => Post, {nullable: true})
  async updatePost(
    @Arg('id') id:number,
    @Arg('title', () => String, {nullable: true}) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      await Post.update({id}, {title});
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id:number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
