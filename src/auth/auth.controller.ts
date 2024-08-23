import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
import { SignupResponse, SigninResponse } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<SignupResponse> {
    return this.authService.signup(createUserDto);
  }

  @Post('signin')
  async signin(@Body() signinDto: SigninDto): Promise<SigninResponse> {
    return this.authService.signin(signinDto);
  }
}
