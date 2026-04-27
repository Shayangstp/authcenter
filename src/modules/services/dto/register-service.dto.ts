import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsString } from 'class-validator';

export enum AuthorizationModel {
  RBAC = 'RBAC',
  ABAC = 'ABAC',
  PBAC = 'PBAC',
  ACL = 'ACL',
  REBAC = 'ReBAC',
}

export class RegisterServiceDto {
  @ApiProperty({ example: 'trello-service' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: AuthorizationModel, isArray: true, example: ['RBAC', 'ABAC'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AuthorizationModel, { each: true })
  enabledModels!: AuthorizationModel[];

  @ApiProperty({ example: ['board', 'card'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  resources!: string[];

  @ApiProperty({ example: ['create', 'read', 'update', 'delete'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  actions!: string[];
}
