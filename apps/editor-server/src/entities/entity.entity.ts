import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EntityObj {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
