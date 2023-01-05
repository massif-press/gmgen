import { Generator } from '../../lib/generator';
import GeneratorLibrary from '../../lib/generatorLibrary';
import { logLevel } from '../../lib/util';
import * as data from './data';

const basicDemo = (): string => {
  const library = new GeneratorLibrary(data);
  const myGenerator = new Generator(library);

  // Shows the Generator's debug logging in the console
  myGenerator.SetOption('Logging', logLevel.debug);

  return myGenerator.Generate(data.templates);
};

export default basicDemo;
