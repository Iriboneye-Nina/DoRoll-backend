import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PasswordDto } from './dto/password.dto';
import { v2 as cloudinary } from 'cloudinary';

import * as bcrypt from 'bcrypt';
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
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<{ message: string; user: User }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.update({ id: userId }, updateProfileDto);
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

  async getUser(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ id });
  }

  async updatePassword(
    userId: number,
    updatePasswordDto: PasswordDto,
  ): Promise<{ message: string; user: User }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    await this.userRepository.update(
      { id: userId },
      { password: hashedPassword },
    );

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    return {
      message: 'Password updated successfully',
      user: updatedUser,
    };
  }
  async uploadImage(file: MulterFile): Promise<any> {
    if (!file || !file.buffer) {
      throw new Error('No file provided or file buffer is undefined');
    }
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream((error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(file.buffer);
    });
  }
}
