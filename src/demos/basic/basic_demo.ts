import * as gmgen from 'gmgen';

import data from './data/basic_example_data.json';

const basicDemo = (): string => {
  const myGenerator = new gmgen.Generator();
  myGenerator.AddData(data);

  // Check the Console to see detailed Generator logs
  myGenerator.SetOption('Logging', gmgen.logLevel.debug);

  return myGenerator.Generate(data);
};

export default basicDemo;
