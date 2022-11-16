import { Generator } from '../../lib/generator';
import GeneratorLibrary from '../../lib/generatorLibrary';
import * as data from './data';

const basicDemo = (): string => {
  const library = new GeneratorLibrary(data);
  const myGenerator = new Generator(library);

  return myGenerator.Generate(data.templates);
};

export default basicDemo;
