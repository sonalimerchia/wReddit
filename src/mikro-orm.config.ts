import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

export default {
  migrations: {
    path: path.join(__dirname, './migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // typescript or javascript
  },
  entities: [ Post ],
  username: 'postgres',
  password: 'Anjali12',
  dbName: 'redditclone',
  type: 'postgresql',
  debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];

// Last line exports the object as if it were the first set of parameters
// for MikroORM.init()
