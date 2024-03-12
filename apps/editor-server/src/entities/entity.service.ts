import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityObj } from './entity.entity';

@Injectable()
export class EntitiesService {
  constructor(
    @InjectRepository(EntityObj)
    private readonly usersRepository: Repository<EntityObj>,
  ) {}

  create(createEntityDto: { name: string }): Promise<EntityObj> {
    const user = new EntityObj();
    user.name = createEntityDto.name;

    return this.usersRepository.save(user);
  }
}
