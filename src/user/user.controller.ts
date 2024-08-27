import {
  Controller,
  UseFilters,
  UseGuards,
  Put,
  Body,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from 'src/todo/filters/all-exceptions.filter';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ERole } from './role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { ResponseDto } from 'src/shared/response-dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
@UseFilters(AllExceptionsFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('update-profile')
  @Roles(ERole.USER)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ResponseDto<any>> {
    const userId = req.user.userId; // Retrieve userId from req.user

    const updatedUser = await this.userService.updateProfile(
      userId,
      updateProfileDto,
    );

    const result = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
    };

    return new ResponseDto(
      200,
      'success',
      'Profile updated successfully',
      result,
    );
  }
}
