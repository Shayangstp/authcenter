import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity } from 'src/database/entities/service.entity';
import { EventsService } from '../events/events.service';
import { RegisterServiceDto } from './dto/register-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceEntity) private readonly servicesRepository: Repository<ServiceEntity>,
    private readonly eventsService: EventsService,
  ) {}

  async registerService(payload: RegisterServiceDto): Promise<ServiceEntity> {
    const existing = await this.servicesRepository.findOne({ where: { name: payload.name } });
    const service = existing ? this.servicesRepository.merge(existing, payload) : this.servicesRepository.create(payload);
    const created = await this.servicesRepository.save(service);
    await this.eventsService.publish('service.registered', {
      serviceId: created.id,
      name: created.name,
      enabledModels: created.enabledModels,
    });
    return created;
  }

  findAll(): Promise<ServiceEntity[]> {
    return this.servicesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findByName(name: string): Promise<ServiceEntity> {
    const service = await this.servicesRepository.findOne({ where: { name } });
    if (!service) {
      throw new NotFoundException(`Service ${name} is not registered`);
    }
    return service;
  }
}
