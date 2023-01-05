import gmgen from '../../../dist/src';

import * as data from './data';

const advancedDemo = (): string => {
  const weaponLibrary = new gmgen.GeneratorLibrary(data);
  const myGenerator = new gmgen.Generator(weaponLibrary, {
    Logging: 'verbose',
  });

  // Check the Console to see detailed Generator logs
  myGenerator.SetOption('Logging', gmgen.logLevel.debug);

  return myGenerator.Generate(data.itemTemplate);
};

export default advancedDemo;
