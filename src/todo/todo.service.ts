import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './todo.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    isDone?: boolean,
  ): Promise<Todo[]> {
    const query = this.todoRepository.createQueryBuilder('todo');

    if (isDone !== undefined) {
      query.andWhere('todo.isDone = :isDone', { isDone });
    }

    query.skip((page - 1) * limit).take(limit);

    return query.getMany();
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOneBy({ id });
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  async create(todo: Partial<Todo>): Promise<Todo> {
    const existingTodo = await this.todoRepository.findOneBy({
      title: todo.title,
    });
    if (existingTodo) {
      throw new ConflictException(
        `Todo with title '${todo.title}' already exists`,
      );
    }

    const newTodo = this.todoRepository.create(todo);
    try {
      return await this.todoRepository.save(newTodo);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create todo');
    }
  }

  async update(id: number, todo: Partial<Todo>): Promise<Todo> {
    const existingTodo = await this.findOne(id);
    if (todo.title) {
      const conflictingTodo = await this.todoRepository.findOneBy({
        title: todo.title,
      });
      if (conflictingTodo && conflictingTodo.id !== id) {
        throw new ConflictException(
          `Todo with title '${todo.title}' already exists`,
        );
      }
    }

    Object.assign(existingTodo, todo);
    try {
      return await this.todoRepository.save(existingTodo);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update todo');
    }
  }

  async remove(id: number): Promise<void> {
    const existingTodo = await this.findOne(id);
    try {
      await this.todoRepository.remove(existingTodo);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete todo');
    }
  }
}
