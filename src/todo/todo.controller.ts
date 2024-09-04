import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  UseFilters,
  ValidationPipe,
  UseGuards,
  Req,
  ForbiddenException,
  HttpStatus,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto, UpdateTodoDto } from './dto/todos-dto';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { Todo } from './todo.entity';
import { ResponseDto } from 'src/shared/response-dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ERole } from 'src/user/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { PositiveIntPipe } from 'src/common/positive-int.pipe';
import { MarkTodoDto } from './dto/status.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Todos')
@ApiBearerAuth()
@Controller('todos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseFilters(AllExceptionsFilter)
export class TodoController {
  todoRepository: any;
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @Roles(ERole.ADMIN)
  @ApiOperation({ summary: 'Get all todos' })
  @ApiResponse({
    status: 200,
    description: 'Todos retrieved successfully',
    type: [Todo],
  })
  async findAll(): Promise<ResponseDto<Todo[]>> {
    const todos = await this.todoService.findAll();
    return new ResponseDto(
      200,
      'success',
      'Todos retrieved successfully',
      todos,
    );
  }

  @Get('my-todos')
  @Roles(ERole.USER)
  @ApiOperation({ summary: 'Get todos for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Your todos retrieved successfully',
    type: [Todo],
  })
  async findMyTodos(@Req() req: any): Promise<ResponseDto<Todo[]>> {
    const userId = req.user.userId;
    const todos = await this.todoService.findUserTodos(userId);
    return new ResponseDto(
      200,
      'success',
      'Your todos retrieved successfully',
      todos,
    );
  }

  @Get(':id')
  @Roles(ERole.USER, ERole.ADMIN)
  @ApiOperation({ summary: 'Get a specific todo by ID' })
  @ApiResponse({
    status: 200,
    description: 'Todo retrieved successfully',
    type: Todo,
  })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  async findOne(
    @Req() req: any,
    @Param('id', PositiveIntPipe) id: number,
  ): Promise<ResponseDto<any>> {
    const todo = await this.todoService.findOne(id);
    const userId = req.user.userId;

    if (!todo) {
      return new ResponseDto(404, 'error', `Todo with ID ${id} not found`);
    }

    if (req.user.role === ERole.USER && todo.user.id !== userId) {
      throw new ForbiddenException('You are not allowed to view this todo');
    }
    const result = {
      ...todo,
      user: {
        id: todo.user.id,
        role: todo.user.role,
      },
    };
    return new ResponseDto(
      200,
      'success',
      `Todo with ID ${id} retrieved successfully`,
      result,
    );
  }

  @Post()
  @Roles(ERole.USER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({
    status: 201,
    description: 'Todo created successfully',
    type: Todo,
  })
  async create(
    @Req() req: any,
    @Body() createTodoDto: CreateTodoDto,
  ): Promise<ResponseDto<any>> {
    const userId = req.user.userId;
    const todo = await this.todoService.create(createTodoDto, userId);
    const result = {
      ...todo,
      user: {
        id: todo.user.id,
        role: todo.user.role,
      },
    };
    return new ResponseDto(201, 'success', 'Todo created successfully', result);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update an existing todo' })
  @ApiResponse({
    status: 200,
    description: 'Todo updated successfully',
    type: Todo,
  })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  async update(
    @Req() req: any,
    @Param('id', PositiveIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<ResponseDto<any>> {
    const userId = req.user.userId;
    const todo = await this.todoService.update(id, updateTodoDto, userId);
    const result = {
      ...todo,
      user: {
        id: todo.user.id,
        role: todo.user.role,
      },
    };
    return new ResponseDto(
      200,
      'success',
      `Todo with ID ${id} updated successfully`,
      result,
    );
  }
  @Put('mark/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(ERole.USER)
  async markingTask(
    @Param('id') id: string,
    @Body() marking: MarkTodoDto,
  ): Promise<{ message: string }> {
    const taskId = parseInt(id, 10);
    try {
      const task = await this.todoRepository.findOne({ where: { id: taskId } });
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      await this.todoRepository.update(id, marking);
      const updatedtask = await this.todoRepository.findOne({
        where: { id: taskId },
      });
      if (!updatedtask) {
        throw new HttpException(
          'Failed to mark',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return {
        message: `Task with ID ${id} successfully marked as done`,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to mark task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Delete(':id')
  @Roles(ERole.USER)
  @ApiOperation({ summary: 'Delete an existing todo' })
  @ApiResponse({ status: 200, description: 'Todo deleted successfully' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  async remove(
    @Req() req: any,
    @Param('id', PositiveIntPipe) id: number,
  ): Promise<ResponseDto<void>> {
    const userId = req.user.userId;
    await this.todoService.remove(id, userId);
    return new ResponseDto(
      200,
      'success',
      `Todo with ID ${id} deleted successfully`,
    );
  }
}
