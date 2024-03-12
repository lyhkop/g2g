import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityObj } from './entity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EntityObj])],
  providers: [],
  controllers: [],
})
export class EntitiesModule {}
