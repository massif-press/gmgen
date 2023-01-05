import { Generator } from '../../lib/generator';
import GeneratorLibrary from '../../lib/generatorLibrary';
import { logLevel } from '../../lib/util';
import * as data from './data';

const advancedDemo = (): string => {
  const weaponLibrary = new GeneratorLibrary(data);
  const myGenerator = new Generator(weaponLibrary, {
    Logging: 'verbose',
  });

  // Check the Console to see detailed Generator logs
  myGenerator.SetOption('Logging', logLevel.debug);

  return myGenerator.Generate(data.itemTemplate);
};

export default advancedDemo;
