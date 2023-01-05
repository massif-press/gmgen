import * as gmgen from 'gmgen';

import data from './data/basic_example_data.json';

const basicDemo = (): string => {
  const weaponLibrary = new gmgen.GeneratorLibrary(data);
  const myGenerator = new gmgen.Generator(weaponLibrary);

  // Check the Console to see detailed Generator logs
  myGenerator.SetOption('Logging', gmgen.logLevel.debug);

  return myGenerator.Generate();
};

export default basicDemo;
