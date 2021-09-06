import { ApiProperty } from '@nestjs/swagger';

export class FilterOptionsDto {
  @ApiProperty({ type: Number })
  offset?: number;

  @ApiProperty({ type: Number })
  limit?: number;

  @ApiProperty({ type: [String] })
  relations?: string[];

  @ApiProperty({ type: [String] })
  equals?: string[];

  @ApiProperty({ type: [String] })
  contains?: string[];

  @ApiProperty({ type: [String] })
  betweens?: string[];

  @ApiProperty({ type: [String] })
  selects?: string[];

  @ApiProperty({ type: [String] })
  sort?: string[];
}
