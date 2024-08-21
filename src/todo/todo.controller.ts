import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto, UpdateTodoDto } from './dto/todos-dto';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { Todo } from './todo.entity';
import { ResponseDto } from 'src/shared/response-dto';

@Controller('todos')
@UseFilters(AllExceptionsFilter)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isDone') isDone?: boolean,
  ): Promise<ResponseDto<Todo[]>> {
    const todos = await this.todoService.findAll(page, limit, isDone);
    return new ResponseDto(
      200,
      'success',
      'Todos retrieved successfully',
      todos,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ResponseDto<Todo>> {
    const todo = await this.todoService.findOne(id);
    if (!todo) {
      return new ResponseDto(404, 'error', `Todo with ID ${id} not found`);
    }
    return new ResponseDto(
      200,
      'success',
      `Todo with ID ${id} retrieved successfully`,
      todo,
    );
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createTodoDto: CreateTodoDto,
  ): Promise<ResponseDto<Todo>> {
    const newTodo = await this.todoService.create(createTodoDto);
    return new ResponseDto(
      201,
      'success',
      'Todo created successfully',
      newTodo,
    );
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<ResponseDto<Todo>> {
    await this.todoService.update(id, updateTodoDto);
    return new ResponseDto(
      200,
      'success',
      `Todo with ID ${id} updated successfully`,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ResponseDto<void>> {
    await this.todoService.remove(id);
    return new ResponseDto(
      200,
      'success',
      `Todo with ID ${id} deleted successfully`,
    );
  }
}
