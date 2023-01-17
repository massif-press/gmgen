import * as gmgen from 'gmgen';

import * as data from './data';

const advancedDemo = (): string => {
  const myGenerator = new gmgen.Generator();
  myGenerator.AddData(data);

  // Shows the Generator's debug logging in the console
  myGenerator.SetOption('Logging', gmgen.logLevel.debug);

  return myGenerator.Generate(data.templates);
};

export default advancedDemo;
