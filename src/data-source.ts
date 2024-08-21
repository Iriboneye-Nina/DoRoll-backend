import { DataSource } from 'typeorm';
import { User } from './user/entities/user.entity';
import { Todo } from './todo/todo.entity';

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as any,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Todo],
  synchronize: false,
  migrations: ['src/migrations/*.ts'],
});
