import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial20210118235733 implements MigrationInterface {
  name = 'Initial20210118235733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" text not null, "email" text not null, "password" text not null);');
    await queryRunner.query('alter table "user" add constraint "user_username_unique" unique ("username");');
    await queryRunner.query('alter table "user" add constraint "user_email_unique" unique ("email");');

    await queryRunner.query('create table "post" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null);');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    
  }
}
