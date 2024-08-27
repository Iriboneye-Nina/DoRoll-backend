import {
  Controller,
  Post,
  Body,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'src/shared/response-dto';
import { loginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ResetPasswordDto } from './dto/resetdto';
import { ForgotPasswordDto } from './dto/forgotdto';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: loginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (user) {
      return this.authService.login(user);
    }
    return new ResponseDto(400, 'error', 'Invalid credentials');
  }

  @Post('register')
  async register(@Body() registerDto: SignupDto) {
    try {
      await this.authService.register(registerDto);
      return new ResponseDto(
        201,
        'success',
        'User registered successfully. Please check your email to activate your account.',
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseDto(409, 'error', error.message);
      }
      return new ResponseDto(
        500,
        'error',
        'An error occurred during registration.',
      );
    }
  }
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      await this.authService.forgotPassword(forgotPasswordDto.email);
      return new ResponseDto(200, 'success', 'Password reset link sent');
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new ResponseDto(404, 'error', error.message);
      }
      return new ResponseDto(500, 'error', 'Failed to process request', error);
    }
  }
  @Get('verify-email')
  async verifyEmail(@Body() { token }: { token: string }) {
    try {
      await this.authService.verifyEmail(token);
      return new ResponseDto(200, 'success', 'Email verified successfully');
    } catch (error) {
      if (error instanceof BadRequestException) {
        return new ResponseDto(400, 'error', error.message);
      }
      if (error instanceof NotFoundException) {
        return new ResponseDto(404, 'error', error.message);
      }
      return new ResponseDto(500, 'error', 'Failed to process request');
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
      return new ResponseDto(200, 'success', 'Password reset successfully');
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        return new ResponseDto(400, 'error', error.message);
      }
      return new ResponseDto(500, 'error', 'Failed to process request');
    }
  }
  @Post('logout')
  async logout() {
    try {
      await this.authService.logout();
      return new ResponseDto(200, 'success', 'Logged out successfully');
    } catch (error) {
      return new ResponseDto(500, 'error', 'Logout failed');
    }
  }
}
