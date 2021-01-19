import "reflect-metadata";

import {__prod__, COOKIE_NAME, FRONTEND_URL, BACKEND_URL } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import {getTypeormConnection} from "./typeorm-config";

const main = async () => {
  // Create database connection
  const conn = await getTypeormConnection();

  // Create connection to server
  const app = express();

  // Be able to maintain session as user traverses pages
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  // enable cors
  const corsOptions = {
    origin: FRONTEND_URL,
    credentials: true
  };

  app.use(
      session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
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
    context: ({req, res}) => ({req: req, res: res, redis:redis})
  });

  apolloServer.applyMiddleware({app, cors: corsOptions});

  // app.get('/path/to/page', (req, res) is a Get-Request where req = request and res = response)
  // use _ as parameter name if not using in implementation
  app.get('/', (_, res) => {
    res.send('hello');
  });

  app.listen(4000, () => {
    console.log('server started on', BACKEND_URL);
  });
};

main().catch((err) => {
  console.error(err);
});
