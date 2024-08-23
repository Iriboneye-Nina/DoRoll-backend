// src/user/dto/user-response.dto.ts
import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  // Add other fields as needed

  constructor(user: User) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    // Initialize other fields as needed
  }
}
