import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { error } from 'console';

@Injectable()
export class HealthService {
  constructor(private readonly prismaService: PrismaService) {}
  async check() {
    try {
      await this.prismaService.user.count();
    } catch (error) {
      return {
        status: error,
        database: 'Disconnected',
      };
    }
    return {
      status: 'ok',
      database: 'Connected',
    };
  }
}
