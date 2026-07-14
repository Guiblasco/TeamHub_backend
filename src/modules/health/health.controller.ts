import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  @Get()
  @ApiOperation({
    summary: 'Check application health',
  })
  @ApiOkResponse({
    description: 'Application is running correctly',
  })
  check() {
    return this.healthService.check();
  }
}
