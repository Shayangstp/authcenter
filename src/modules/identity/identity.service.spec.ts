import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { UserEntity } from 'src/database/entities/user.entity';
import { SessionEntity } from 'src/database/entities/session.entity';
import { UserRoleEntity } from 'src/database/entities/user-role.entity';
import { CacheLayerService } from '../cache/cache.service';
import { EventsService } from '../events/events.service';

describe('IdentityService', () => {
  let service: IdentityService;
  let usersRepository: Repository<UserEntity>;
  let sessionsRepository: Repository<SessionEntity>;
  let userRolesRepository: Repository<UserRoleEntity>;
  let jwtService: JwtService;
  let cacheService: CacheLayerService;
  let eventsService: EventsService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$test',
    active: true,
    emailVerified: false,
    mfaEnabled: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SessionEntity),
          useValue: {
            save: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserRoleEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, unknown> = {
                'auth.accessTtl': 900,
                'auth.refreshTtl': 604800,
              };
              return config[key];
            }),
          },
        },
        {
          provide: CacheLayerService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
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

    service = module.get<IdentityService>(IdentityService);
    usersRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    sessionsRepository = module.get<Repository<SessionEntity>>(getRepositoryToken(SessionEntity));
    userRolesRepository = module.get<Repository<UserRoleEntity>>(getRepositoryToken(UserRoleEntity));
    jwtService = module.get<JwtService>(JwtService);
    cacheService = module.get<CacheLayerService>(CacheLayerService);
    eventsService = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw BadRequestException if email already exists', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser as UserEntity);

      await expect(
        service.register({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'Password123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should register a new user successfully', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersRepository, 'create').mockReturnValue(mockUser as UserEntity);
      jest.spyOn(usersRepository, 'save').mockResolvedValue(mockUser as UserEntity);
      jest.spyOn(sessionsRepository, 'create').mockReturnValue({} as SessionEntity);
      jest.spyOn(sessionsRepository, 'save').mockResolvedValue({} as SessionEntity);

      const result = await service.register({
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'Password123!',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(eventsService.publish).toHaveBeenCalledWith('user.created', expect.any(Object));
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.login({
          email: 'wrong@example.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify user email', async () => {
      jest.spyOn(usersRepository, 'update').mockResolvedValue(undefined as never);

      const result = await service.verifyEmail('user-123');

      expect(result.message).toBe('Email verified successfully.');
      expect(eventsService.publish).toHaveBeenCalledWith('user.updated', expect.any(Object));
    });
  });
});
