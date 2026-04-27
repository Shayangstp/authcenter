import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty()
  total!: number;

  @ApiProperty({ isArray: true })
  items!: T[];
}
