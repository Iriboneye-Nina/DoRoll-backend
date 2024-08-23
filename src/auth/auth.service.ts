import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/entities/user.entity';

export interface SignupResponse {
  message: string;
  data: User[];
}

export interface SigninResponse {
  message: string;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<SignupResponse> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = await this.userService.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const userWithoutPassword = {
        ...newUser,
        password: undefined,
      };

      return {
        message: 'User successfully created',
        data: [userWithoutPassword],
      };
    } catch (error) {
      console.log(error);
      throw new Error('Error during signup');
    }
  }

  async signin(signinDto: SigninDto): Promise<SigninResponse> {
    try {
      const { email, password } = signinDto;

      const user = await this.userService.findByEmail(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload);

      return {
        message: 'User successfully logged in',
        token: accessToken,
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Login failed');
    }
  }
}
