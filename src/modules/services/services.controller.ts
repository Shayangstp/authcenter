import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ServiceEntity } from 'src/database/entities/service.entity';
import { RegisterServiceDto } from './dto/register-service.dto';
import { ServicesService } from './services.service';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post('register')
  @ApiCreatedResponse({ type: ServiceEntity })
  register(@Body() payload: RegisterServiceDto): Promise<ServiceEntity> {
    return this.servicesService.registerService(payload);
  }

  @Get()
  @ApiOkResponse({ type: ServiceEntity, isArray: true })
  list(): Promise<ServiceEntity[]> {
    return this.servicesService.findAll();
  }
}
