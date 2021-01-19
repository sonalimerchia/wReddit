import "reflect-metadata";

import { MikroORM } from "@mikro-orm/core";
import { __prod__ , COOKIE_NAME} from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

const main = async () => {
  // Create database connection
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  // Create connection to server
  const app = express();

  // Be able to maintain session as user traverses pages
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  // enable cors
  const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
  };

  app.use(
      session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__
      },
      saveUninitialized: false,
      secret: 'sdfghjkkgfdfghjkuytfd',
      resave: false,
    })
  );

  // Link app to database
  const apolloServer = new ApolloServer({
    playground: true,
    introspection: true,
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({req, res}) => ({em: orm.em, req: req, res: res})
  });

  apolloServer.applyMiddleware({app, cors: corsOptions});

  // app.get('/path/to/page', (req, res) is a Get-Request where req = request and res = response)
  // use _ as parameter name if not using in implementation
  app.get('/', (_, res) => {
    res.send('hello');
  });

  app.listen(4000, () => {
    console.log('server started on localhost:4000');
  });
};

main().catch((err) => {
  console.error(err);
});
