import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { ResetToken } from './entities/reset-token.entity';
import { EmailService } from 'src/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ResetToken)
    private readonly resetTokenRepository: Repository<ResetToken>,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && bcrypt.compareSync(pass, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      statusCode: 200,
      status: 'success',
      message: 'Logged in succesfully',
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userDto: any) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: userDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Account already exists');
    }

    const hashedPassword = bcrypt.hashSync(userDto.password, 10);
    const newUser = this.userRepository.create({
      ...userDto,
      password: hashedPassword,
    });
    // Ensure this returns a single User object
    const savedUser = (await this.userRepository.save(
      newUser,
    )) as unknown as User;

    // Save ResetToken after registering the user
    await this.saveResetToken(savedUser.id);

    const activationToken = uuidv4(); // Generate a unique activation token
    const activationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${activationToken}`;

    await this.emailService.sendEmail(
      userDto.email,
      'Account Activation',
      `Please activate your account by clicking the following link: ${activationUrl}`,
      `<p>Please activate your account by clicking the following link: <a href="${activationUrl}">Activate Account</a></p>`,
    );

    return savedUser;
  }

  async saveResetToken(userId: number): Promise<ResetToken> {
    const token = uuidv4();

    const resetToken = this.resetTokenRepository.create({
      userId,
      token,
      expiresAt: new Date(Date.now() + 3600000),
    });

    return await this.resetTokenRepository.save(resetToken);
  }
  async verifyEmail(token: string): Promise<void> {
    const resetToken = await this.resetTokenRepository.findOne({
      where: { token },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepository.findOne({
      where: { id: resetToken.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isEmailVerified = true;
    await this.userRepository.save(user);

    // Delete all tokens associated with this user
    await this.resetTokenRepository.delete({ userId: user.id });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = uuidv4();
    const resetToken = this.resetTokenRepository.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 3600000), // Token expires in 1 hour
    });
    await this.resetTokenRepository.save(resetToken);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.emailService.sendEmail(
      email,
      'Password Reset Request',
      `Please use the following link to reset your password: ${resetUrl}`,
      `<p>Please use the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.resetTokenRepository.findOne({
      where: { token },
    });
    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepository.findOne({
      where: { id: resetToken.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    await this.resetTokenRepository.delete({ token });
  }

  async logout(): Promise<void> {}
}
