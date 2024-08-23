import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { Todo } from './todo.entity';
import { User } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { AuthModule } from 'src/auth/auth.module'; // Import AuthModule
import { UserModule } from 'src/user/user.module'; // Import UserModule
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo, User]),
    AuthModule, // Import AuthModule to use JwtService
    UserModule, // Import UserModule to use UserService
  ],
  providers: [
    TodoService,
    JwtAuthGuard,
    JwtService, // Register JwtAuthGuard as a provider
  ],
  controllers: [TodoController],
})
export class TodoModule {}
