import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from './Order';

export type MesaStatus = 'available' | 'busy' | 'reserved';
export type TipoElemento = 'mesa' | 'referencia';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  label!: string;

  @Column({ type: 'int' })
  seats!: number;

  @Column({
    type: 'enum',
    enum: ['available', 'busy', 'reserved'],
    default: 'available'
  })
  status!: MesaStatus;

  // Propriedades de posicionamento no canvas
  @Column({ type: 'varchar', default: 'mesa' })
  tipo!: TipoElemento;

  @Column({ type: 'float' })
  x!: number;

  @Column({ type: 'float' })
  y!: number;

  @Column({ type: 'float', nullable: true })
  width?: number;

  @Column({ type: 'float', nullable: true })
  height?: number;

  @Column({ type: 'boolean', default: false })
  lock!: boolean;

  @OneToMany(() => Order, (order) => order.table)
  orders!: Order[];

}
