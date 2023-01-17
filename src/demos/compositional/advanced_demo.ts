import * as gmgen from 'gmgen';

import * as data from './data';

const advancedDemo = (): string => {
  const myGenerator = new gmgen.Generator({
    // Check the Console to see detailed Generator logs
    Logging: gmgen.logLevel.debug,
  });

  myGenerator.AddData(data);

  return myGenerator.Generate(data.itemTemplate);
};

export default advancedDemo;
