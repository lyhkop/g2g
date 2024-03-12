import { Body, Controller, Post } from '@nestjs/common';
import { EntityObj } from './entity.entity';
import { EntitiesService } from './entity.service';

@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Post()
  create(@Body() createUserDto: { name: string }): Promise<EntityObj> {
    return this.entitiesService.create(createUserDto);
  }
}
