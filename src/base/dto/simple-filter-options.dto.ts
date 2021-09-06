import { ApiProperty } from '@nestjs/swagger';
import { Any } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class SimpleFilterOptionsDto {
  @ApiModelProperty({ example: ['id', 'name'] })
  @ApiProperty({ type: [String] })
  selects?: []; // indicates which properties of the main object must be selected

  @ApiModelProperty({ example: ['user', 'csu'] })
  @ApiProperty({ type: [String] })
  relations?: string[]; // relations needs to be loaded with the main entity. Sub-relations can also be loaded (shorthand for join and leftJoinAndSelect)

  @ApiProperty({ type: Any })
  join?: any; // joins needs to be performed for the entity. Extended version of "relations".

  @ApiModelProperty({ example: [{ name: 'Branch 1', code: 'BR1' }] })
  @ApiProperty({ type: [String] })
  where?: []; // simple conditions by which entity should be queried.

  @ApiModelProperty({
    example: {
      id: 'DESC',
    },
  })
  @ApiProperty({ type: Object })
  order?: any = {
    id: 'DESC',
  }; // selection order.(ASC/DESC)

  @ApiModelProperty({ example: false })
  @ApiProperty({ type: Boolean })
  withDeleted?: boolean = false; // include entities which have been soft deleted with softDelete or softRemove, e.g. have their @DeleteDateColumn column set

  @ApiProperty({ type: Number })
  skip?: number = 0; // offset (paginated) from where entities should be taken.

  @ApiModelProperty({ example: 10 })
  @ApiProperty({ type: Number })
  take?: number = 10; // limit (paginated) - max number of entities that should be taken.
}
