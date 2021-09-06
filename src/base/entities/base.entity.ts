import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export class Base extends BaseEntity {
  @Column({ name: 'created_by', length: 50, default: 'SYSTEM' })
  createdBy: string;

  @Column({ name: 'updated_by', length: 50, default: 'SYSTEM' })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;

  @DeleteDateColumn({ name: 'deleted_on' })
  deletedOn: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
