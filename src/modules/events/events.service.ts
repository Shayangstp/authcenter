import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper, AmqpConnectionManager } from 'amqp-connection-manager';

@Injectable()
export class EventsService implements OnModuleDestroy {
  private readonly logger = new Logger(EventsService.name);
  private readonly connection: AmqpConnectionManager;
  private readonly channel: ChannelWrapper;

  constructor(private readonly configService: ConfigService) {
    const username = this.configService.get<string>('messaging.rabbitmqUsername');
    const password = this.configService.get<string>('messaging.rabbitmqPassword');
    const host = this.configService.get<string>('messaging.rabbitmqHost');
    const port = this.configService.get<number>('messaging.rabbitmqPort');
    const vhost = encodeURIComponent(this.configService.get<string>('messaging.rabbitmqVhost', '/'));
    const url = `amqp://${username}:${password}@${host}:${port}/${vhost}`;

    this.connection = amqp.connect([url]);
    this.channel = this.connection.createChannel({
      setup: async (channel: any) => {
        await channel.assertExchange('auth_center.events', 'topic', { durable: true });
      },
    });
  }

  async publish(routingKey: string, payload: Record<string, unknown>): Promise<void> {
    await this.channel.publish('auth_center.events', routingKey, Buffer.from(JSON.stringify(payload)));
    this.logger.debug(`Published event ${routingKey}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
  }
}
