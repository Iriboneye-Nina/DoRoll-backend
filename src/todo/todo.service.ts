import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './todo.entity';
import { User } from 'src/user/entities/user.entity';
import { EStatus } from './status.enum';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Fetch all todos without status filtering
  async findAll(): Promise<Todo[]> {
    return this.todoRepository.find();
  }

  // Fetch all todos for a specific user without status filtering
  async findUserTodos(userId: number): Promise<Todo[]> {
    return this.todoRepository.find({ where: { user: { id: userId } } });
  }

  // Fetch a single todo by ID
  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  // Determine the status based on the todo's deadline or other criteria
  private determineStatus(todo: Partial<Todo>): EStatus {
    const today = new Date();
    const deadline = new Date(todo.deadline);

    if (todo.status === EStatus.DONE) {
      return EStatus.DONE;
    }

    if (deadline < today) {
      return EStatus.OFF_TRACK;
    }

    if (deadline >= today) {
      return EStatus.ON_TRACK;
    }

    return EStatus.PENDING;
  }

  // Create a new todo for a specific user
  async create(todo: Partial<Todo>, userId: number): Promise<Todo> {
    const existingTodo = await this.todoRepository.findOne({
      where: { title: todo.title },
    });
    if (existingTodo) {
      throw new ConflictException(
        `Todo with title '${todo.title}' already exists`,
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Use the determineStatus method to set the status before saving
    const status = this.determineStatus(todo);

    const newTodo = this.todoRepository.create({
      ...todo,
      status,
      user,
    });

    try {
      return await this.todoRepository.save(newTodo);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create todo');
    }
  }

  // Update an existing todo for a specific user
  async update(id: number, todo: Partial<Todo>, userId: number): Promise<Todo> {
    const existingTodo = await this.findOne(id);

    if (existingTodo.user.id !== userId) {
      throw new ConflictException('You can only update your own todos');
    }

    // Use the determineStatus method to update the status if necessary
    const status = this.determineStatus(todo);

    Object.assign(existingTodo, { ...todo, status });

    try {
      return await this.todoRepository.save(existingTodo);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update todo');
    }
  }

  // Delete an existing todo for a specific user
  async remove(id: number, userId: number): Promise<void> {
    const existingTodo = await this.findOne(id);

    if (existingTodo.user.id !== userId) {
      throw new ConflictException('You can only delete your own todos');
    }

    try {
      await this.todoRepository.remove(existingTodo);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete todo');
    }
  }
}
