import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  @Get()
  check() {
    return this.healthService.check();
  }
}
