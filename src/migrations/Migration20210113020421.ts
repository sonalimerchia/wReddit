import { Migration } from '@mikro-orm/migrations';

export class Migration20210113020421 extends Migration {

  async up(): Promise<void> {
    // SQL commands

    // create table for posts with the following columns:
    // id of type serial primary key
    // created_at and updated_at of type timestamptz
    // title of type text not null
    this.addSql('create table "post" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null);');
  }

}
