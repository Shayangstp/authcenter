import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DownstreamAuthorizationService {
  constructor(private readonly httpService: HttpService) {}

  async authorize(payload: {
    userId: string;
    service: string;
    resource: string;
    action: string;
    resourceId?: string;
    context?: Record<string, unknown>;
  }) {
    const { data } = await firstValueFrom(this.httpService.post('http://localhost:4100/api/authorize', payload));
    return data as { allowed: boolean; reasons: string[]; evaluatedModels: string[] };
  }
}
