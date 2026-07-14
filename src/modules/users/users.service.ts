import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findById(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });
  }
}
