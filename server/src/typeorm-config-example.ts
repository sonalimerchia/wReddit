import {createConnection} from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export const getTypeormConnection = () => {
  return createConnection({
    type: 'postgres',
    database: 'wreddit',
    username: 'username',
    password: 'password',
    logging: false,
    synchronize: true,
    entities: [Post, User]
  });
}
