import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Center E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Identity Module', () => {
    it('/api/auth/register (POST) - should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          firstName: 'Test',
          lastName: 'User',
          password: 'StrongPassword123!',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('accessToken');
          expect(response.body).toHaveProperty('refreshToken');
          expect(response.body).toHaveProperty('expiresIn');
          accessToken = response.body.accessToken;
          refreshToken = response.body.refreshToken;
        });
    });

    it('/api/auth/login (POST) - should login with valid credentials', () => {
      const email = `login-test-${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email,
          firstName: 'Login',
          lastName: 'Test',
          password: 'Password123!',
        })
        .expect(201)
        .then(() => {
          return request(app.getHttpServer())
            .post('/api/auth/login')
            .send({ email, password: 'Password123!' })
            .expect(201)
            .then((response) => {
              expect(response.body).toHaveProperty('accessToken');
              expect(response.body).toHaveProperty('refreshToken');
            });
        });
    });

    it('/api/auth/refresh (POST) - should refresh access token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('accessToken');
          expect(response.body).toHaveProperty('refreshToken');
        });
    });

    it('/api/auth/sessions (GET) - should list user sessions', () => {
      return request(app.getHttpServer())
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });

  describe('Services Module', () => {
    it('/api/services/register (POST) - should register a service', () => {
      return request(app.getHttpServer())
        .post('/api/services/register')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `test-service-${Date.now()}`,
          enabledModels: ['RBAC', 'ABAC'],
          resources: ['post', 'comment'],
          actions: ['create', 'read', 'update', 'delete'],
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.enabledModels).toEqual(['RBAC', 'ABAC']);
        });
    });

    it('/api/services (GET) - should list all services', () => {
      return request(app.getHttpServer())
        .get('/api/services')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });

  describe('Authorization Module', () => {
    it('/api/authorize (POST) - should evaluate authorization', () => {
      return request(app.getHttpServer())
        .post('/api/services/register')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `auth-test-service-${Date.now()}`,
          enabledModels: ['RBAC'],
          resources: ['document'],
          actions: ['read'],
        })
        .expect(201)
        .then((serviceResponse) => {
          return request(app.getHttpServer())
            .post('/api/authorize')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              userId: 'test-user-id',
              service: serviceResponse.body.name,
              resource: 'document',
              action: 'read',
            })
            .expect(201)
            .then((response) => {
              expect(response.body).toHaveProperty('allowed');
              expect(response.body).toHaveProperty('reasons');
              expect(response.body).toHaveProperty('evaluatedModels');
            });
        });
    });
  });
});
