import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RbacService } from './rbac.service';
import { UserRoleEntity } from 'src/database/entities/user-role.entity';

describe('RbacService', () => {
  let service: RbacService;
  let repository: Repository<UserRoleEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        {
          provide: getRepositoryToken(UserRoleEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);
    repository = module.get<Repository<UserRoleEntity>>(getRepositoryToken(UserRoleEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([
        {
          role: {
            rolePermissions: [
              {
                permission: { name: 'test.post.read' },
              },
            ],
          },
        },
      ] as never);

      const result = await service.hasPermission('user-123', 'test.post.read', 'test');

      expect(result).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.hasPermission('user-123', 'test.post.write', 'test');

      expect(result).toBe(false);
    });
  });
});
