import {
  Controller,
  UseFilters,
  UseGuards,
  Put,
  Body,
  Request,
  Param,
  Get,
  NotFoundException,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AllExceptionsFilter } from 'src/todo/filters/all-exceptions.filter';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ERole } from './role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { PasswordDto } from './dto/password.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { UploadFileDto } from '../upload/dto/uploadfile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
};

interface RequestWithUser {
  user?: {
    userId: number;
  };
}
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('User')
@ApiBearerAuth()
@UseFilters(AllExceptionsFilter)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get(':id')
  @Roles(ERole.USER)
  async getUser(
    @Param('id') id: string,
  ): Promise<{ message: string; data?: any }> {
    try {
      const numericId = parseInt(id, 10);

      if (isNaN(numericId)) {
        throw new NotFoundException(`Invalid ID: ${id}`);
      }

      const user = await this.userService.getUser(numericId);
      if (!user) {
        throw new NotFoundException(`User with ID ${numericId} not found`);
      }

      return { message: 'User successfully retrieved', data: user };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Put('update/:id')
  @Roles(ERole.USER)
  async updateProfile(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<{ message: string }> {
    const userId = req.user.userId;

    try {
      const user = await this.userService.updateProfile(
        userId,
        updateProfileDto,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return {
        message: 'User profile data successfully saved',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Put('updatePassword/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(ERole.USER)
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Invalid current password' })
  async updatePassword(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updatePasswordDto: PasswordDto,
  ): Promise<{ message: string }> {
    const userId = req.user.userId.toString();
    try {
      const user = await this.userService.updatePassword(
        userId,
        updatePasswordDto,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return {
        message: 'User password successfully seved',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Post('uploadImage/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(ERole.USER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'File to upload', type: UploadFileDto })
  @ApiResponse({
    status: 201,
    description: 'The image has been uploaded successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. No file provided or file buffer is undefined.',
  })
  async uploadImage(
    @UploadedFile() file: MulterFile,
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; data?: any }> {
    const userId = req.user.userId;
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const result = await this.userService.uploadImage(file);
    const imageUrl = result.secure_url;
    console.log(imageUrl);
    if (!userId) {
      throw new NotFoundException('id not found');
    }
    const User = await this.userService.getUser(userId);
    if (!User) {
      throw new NotFoundException('User not found');
    }
    const updatedUserDto: UpdateProfileDto = {
      firstName: User.firstName,
      lastName: User.lastName,
      email: User.email,
      phone: User.phone,
      profileImage: imageUrl,
    };
    const updatedUser = await this.userService.updateProfile(
      userId,
      updatedUserDto,
    );
    return {
      message: 'Image uploaded and profile updated successfully',
      data: updatedUser,
    };
  }
}
