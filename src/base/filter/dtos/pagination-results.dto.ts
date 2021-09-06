import { ApiProperty } from '@nestjs/swagger';

export class PaginationResultsDto<T> {
  @ApiProperty()
  readonly itemsPerPage: number = 0;

  @ApiProperty()
  readonly totalItems: number = 0;

  @ApiProperty()
  readonly currentPage: number = 0;

  @ApiProperty()
  readonly totalPages: number = 0;

  @ApiProperty()
  items: T[];

  constructor(
    itemsPerPage: number,
    totalItems: number,
    currentPage: number,
    totalPages: number,
    items: T[],
  ) {
    this.itemsPerPage = itemsPerPage;
    this.totalItems = totalItems;
    this.currentPage = currentPage;
    this.totalPages = totalPages;
    this.items = items;
  }
}
