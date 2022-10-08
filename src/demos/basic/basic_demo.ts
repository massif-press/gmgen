import { Generator } from '../../lib/generator';
import { GeneratorLibrary } from '../../lib/generatorLibrary';
import data from './basic_example_data.json';

const basicDemo = (): string => {
  const weaponLibrary = new GeneratorLibrary(data);
  const myGenerator = new Generator(weaponLibrary);

  return myGenerator.Generate();
};

export default basicDemo;
