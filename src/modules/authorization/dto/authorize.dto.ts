import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class AuthorizeDto {
  @ApiProperty({ example: '123' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'blog' })
  @IsString()
  service!: string;

  @ApiProperty({ example: 'post' })
  @IsString()
  resource!: string;

  @ApiProperty({ example: 'delete' })
  @IsString()
  action!: string;

  @ApiProperty({ required: false, example: '99' })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiProperty({ required: false, example: { ownerId: '123', status: 'draft' } })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
