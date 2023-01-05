import { Generator } from '../../lib/generator';
import GeneratorLibrary from '../../lib/generatorLibrary';
import { logLevel } from '../../lib/util';
import data from './data/basic_example_data.json';

const basicDemo = (): string => {
  const weaponLibrary = new GeneratorLibrary(data);
  const myGenerator = new Generator(weaponLibrary);

  // Check the Console to see detailed Generator logs
  myGenerator.SetOption('Logging', logLevel.debug);

  return myGenerator.Generate();
};

export default basicDemo;
