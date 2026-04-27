import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServiceEntity } from 'src/database/entities/service.entity';
import { EventsService } from '../events/events.service';

describe('ServicesService', () => {
  let service: ServicesService;
  let repository: Repository<ServiceEntity>;
  let eventsService: EventsService;

  const mockService = {
    id: 'service-123',
    name: 'test-service',
    enabledModels: ['RBAC', 'ABAC'],
    resources: ['post'],
    actions: ['create', 'read'],
    active: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(ServiceEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            merge: jest.fn(),
          },
        },
        {
          provide: EventsService,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    repository = module.get<Repository<ServiceEntity>>(getRepositoryToken(ServiceEntity));
    eventsService = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerService', () => {
    it('should register a new service', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockService as ServiceEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(mockService as ServiceEntity);

      const result = await service.registerService({
        name: 'test-service',
        enabledModels: ['RBAC', 'ABAC'] as never,
        resources: ['post'],
        actions: ['create', 'read'],
      });

      expect(result).toEqual(mockService);
      expect(eventsService.publish).toHaveBeenCalledWith('service.registered', expect.any(Object));
    });

    it('should update existing service', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockService as ServiceEntity);
      jest.spyOn(repository, 'merge').mockReturnValue(mockService as ServiceEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(mockService as ServiceEntity);

      const result = await service.registerService({
        name: 'test-service',
        enabledModels: ['RBAC'] as never,
        resources: ['post'],
        actions: ['create'],
      });

      expect(result).toEqual(mockService);
    });
  });

  describe('findByName', () => {
    it('should throw NotFoundException if service not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findByName('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should return service if found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockService as ServiceEntity);

      const result = await service.findByName('test-service');

      expect(result).toEqual(mockService);
    });
  });
});
