import {createParts} from './parts.js';
import {createPenguin} from './penguin.js';
import {createBunny} from './bunny.js';
import {createBear} from './bear.js';

// A preset returns the SAME motion contract; the scene never needs to know
// whether it is animating wings, paws or floppy arms.
const factories={penguin:createPenguin,bunny:createBunny,bear:createBear};

export function buildMascot(id) {
  const factory=factories[id] ?? factories.penguin;
  return factory(createParts());
}
