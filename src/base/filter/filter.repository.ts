import { Repository, SelectQueryBuilder } from 'typeorm';
import { NotAcceptableException } from '@nestjs/common';
import { FilterOptionsDto } from './dtos/filter-options.dto';
import { PaginationResultsDto } from './dtos/pagination-results.dto';

/**
 * Provides base repository with pagination and filtering capabilities
 */
export class FilterRepository<T> extends Repository<T> {
  public async findWithPagination(
    options: FilterOptionsDto,
  ): Promise<PaginationResultsDto<T>> {
    const alias = 'alias';
    const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder(alias);
    // process contains values from options
    if (options.selects) {
      for (const [index, select] of options.selects.entries()) {
        const [table, key] = select.split('.');
        if (key) {
          /*if (!this.entityRelationHasOwnProperty(key)) {
            throw new NotAcceptableException(
              `Filter selects query data: ${key} is not acceptable`,
            );
          }*/
        } else {
          if (!this.entityHasOwnProperty(table)) {
            throw new NotAcceptableException(
              `Filter selects query data: ${table} is not acceptable`,
            );
          }
          options.selects[index] = `${alias}.${table}`;
        }
      }
      options.selects.push(`${alias}.id`);
      queryBuilder.select(options.selects);
    }

    // process relationship from options
    if (options.relations) {
      for (let relation of options.relations) {
        // check need select all with join
        let isSelect = false;
        if (relation.endsWith('*')) {
          isSelect = true;
          relation = relation.slice(0, -1);
        }
        const [key, value] = relation.split('.');
        if (!this.entityRelationHas(key)) {
          throw new NotAcceptableException(
            `Filter relations query data: ${key} is not acceptable`,
          );
        }
        if (value) {
          if (!this.entityRelationHasOwnProperty(value)) {
            throw new NotAcceptableException(
              `Filter relations query data: ${value} is not acceptable`,
            );
          }
          if (isSelect) {
            // queryBuilder.leftJoinAndSelect(`${alias}.${key}`, value);
            queryBuilder.leftJoinAndSelect(`${key}.${value}`, value);
          } else {
            // queryBuilder.leftJoin(`${alias}.${key}`, value);
            queryBuilder.leftJoin(`${key}.${value}`, value);
            queryBuilder.addSelect(`${value}.id`);
          }
        } else {
          if (isSelect) {
            queryBuilder.leftJoinAndSelect(`${alias}.${key}`, key);
          } else {
            queryBuilder.leftJoin(`${alias}.${key}`, key);
            queryBuilder.addSelect(`${key}.id`);
          }
        }
      }
    }

    // process contains values from options
    if (options.equals) {
      for (const equal of options.equals) {
        const [path, allValue] = equal.split('=');
        let [table, key] = path.split('.');
        const values = allValue.split(',');
        // validate table and key
        if (key) {
          if (!this.entityRelationHasOwnProperty(key)) {
            throw new NotAcceptableException(
              `Filter equals query data: ${key} is not acceptable`,
            );
          }
        } else {
          if (!this.entityHasOwnProperty(path)) {
            throw new NotAcceptableException(
              `Filter equals query data: ${path} is not acceptable`,
            );
          }
          table = alias;
          key = path;
        }
        // more than one value
        if (!(values.length > 1)) {
          if (values[0] === 'NULL') {
            // create contains search query
            queryBuilder.andWhere(`${table}.${key} IS NULL`);
          } else {
            // create contains search query
            queryBuilder.andWhere(`${table}.${key} =:${key}`, {
              [key]: values[0],
            });
          }
        } else {
          // create contains search query
          queryBuilder.andWhere(`${table}.${key} IN(:${key})`, {
            [key]: values,
          });
        }
      }
    }

    // process contains values from options
    if (options.contains) {
      for (const contain of options.contains) {
        const [path, allValue] = contain.split('=');
        let [table, key] = path.split('.');
        const values = allValue.split(',');
        // validate table and key
        if (key) {
          if (!this.entityRelationHasOwnProperty(key)) {
            throw new NotAcceptableException(
              `Filter contains query data: ${key} is not acceptable`,
            );
          }
        } else {
          if (!this.entityHasOwnProperty(path)) {
            throw new NotAcceptableException(
              `Filter contains query data: ${path} is not acceptable`,
            );
          }
          table = alias;
          key = path;
        }
        // more than one value
        if (!(values.length > 1)) {
          // create like search query
          queryBuilder.andWhere(`LOWER(${table}.${key}) like LOWER(:${key})`, {
            [key]: `%${values[0]}%`,
          });
        } else {
          // create like search query
          for (const value of values) {
            const randomKey = this.getRandomKey();
            queryBuilder.orWhere(
              `LOWER(${table}.${key}) like LOWER(:${randomKey})`,
              {
                [randomKey]: `%${value}%`,
              },
            );
          }
        }
      }
    }

    // process between values from options
    if (options.betweens) {
      for (const between of options.betweens) {
        const [key, from, to] = between.split(',');
        let fromDate;
        let toDate;
        try {
          fromDate = new Date(from).toISOString();
          toDate = new Date(to).toISOString();
        } catch (e) {
          throw new NotAcceptableException(
            `Filter between query dates are not acceptable`,
          );
        }

        queryBuilder.andWhere(`${alias}.${key} BETWEEN :start AND :end`, {
          start: fromDate,
          end: toDate,
        });
      }
    }

    // order ascending or descending
    if (options.sort) {
      // const orderObjectArray = orderObject.split(',');
      for (const k of options.sort) {
        if (k.endsWith('-')) {
          if (this.entityHasOwnProperty(k.slice(0, -1))) {
            queryBuilder.orderBy(`${alias}.${k.slice(0, -1)}`, 'DESC');
          }
        } else if (k.endsWith('+')) {
          if (this.entityHasOwnProperty(k.slice(0, -1))) {
            queryBuilder.orderBy(`${alias}.${k.slice(0, -1)}`, 'ASC');
          }
        } else {
          return;
        }
      }
    }

    // get total count
    const allResultsCount = await queryBuilder.getCount();

    // if not provide paginate options, skip pagination
    if (options.offset !== undefined && options.limit !== undefined) {
      // create paginate query
      queryBuilder.skip(options.offset);
      queryBuilder.take(options.limit);
    }

    // execute query
    const allResultsModelList: T[] = await queryBuilder.getMany();

    return new PaginationResultsDto<T>(
      allResultsModelList.length,
      allResultsCount,
      Math.ceil((options.offset - 1) / options.limit + 1),
      Math.ceil(allResultsCount / options.limit),
      allResultsModelList,
    );
  }

  /***
   * Validate entity attribute
   * @param field entity attribute
   */
  private entityHasOwnProperty(field: string): boolean {
    return this.metadata.propertiesMap.hasOwnProperty(field.split('.')[0]);
  }

  /***
   * Validate entity name
   * @param table entity name
   */
  private entityRelationHas(table: string): boolean {
    for (const relation of this.metadata.relations) {
      if (relation.propertyName === table) {
        return true;
      }
    }
    return false;
  }

  /**
   * Validate entity relationship attribute
   * @param field related entity attribute
   */
  private entityRelationHasOwnProperty(field: string): boolean {
    for (const relation of this.metadata.relations) {
      if (relation.inverseEntityMetadata.propertiesMap.hasOwnProperty(field)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get random key
   */
  private getRandomKey(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
