import { Column, Entity } from 'typeorm';
import { AppBaseEntity } from './base.entity';

@Entity('services')
export class ServiceEntity extends AppBaseEntity {
  @Column({ unique: true })
  name!: string;

  @Column('text', { array: true, name: 'enabled_models', default: '{}' })
  enabledModels!: string[];

  @Column('text', { array: true, default: '{}' })
  resources!: string[];

  @Column('text', { array: true, default: '{}' })
  actions!: string[];

  @Column({ default: true })
  active!: boolean;
}
