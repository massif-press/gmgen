import gmgen from '../../../dist/src';

import * as data from './data';

const basicDemo = (): string => {
  const library = new gmgen.GeneratorLibrary(data);
  const myGenerator = new gmgen.Generator(library);

  // Shows the Generator's debug logging in the console
  myGenerator.SetOption('Logging', gmgen.logLevel.debug);

  return myGenerator.Generate(data.templates);
};

export default basicDemo;
