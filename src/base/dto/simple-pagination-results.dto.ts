import { ApiProperty } from '@nestjs/swagger';

export class SimplePaginationResultsDto<T> {
  @ApiProperty()
  readonly totalItems: number = 0;

  @ApiProperty()
  readonly totalPages: number = 0;

  @ApiProperty()
  readonly currentPage: number = 0;

  @ApiProperty()
  readonly itemsPerPage: number = 0;

  @ApiProperty()
  items;

  constructor(totalItems: number, items: T[], dto: any) {
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / dto.take);
    this.currentPage = Math.ceil((dto.skip - 1) / dto.take + 1);
    this.itemsPerPage = items.length;
    this.items = items;
  }
}
