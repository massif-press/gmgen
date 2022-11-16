import { Generator } from '../../lib/generator';
import GeneratorLibrary from '../../lib/generatorLibrary';
import * as data from './data';

const advancedDemo = (): string => {
  const weaponLibrary = new GeneratorLibrary(data);
  const myGenerator = new Generator(weaponLibrary, {
    Logging: 'verbose',
  });

  return myGenerator.Generate(data.itemTemplate);
};

export default advancedDemo;