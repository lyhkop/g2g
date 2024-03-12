import { assert, expect, test } from 'vitest';
import { Entity } from '../src/engine/entity';

test('测试实体对象', () => {
  const entity = new Entity('01');

  expect(entity.type).equal('Entity');
});
