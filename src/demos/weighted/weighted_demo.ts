import gmgen from '../../../dist/src';

import * as data from './data';

const dynamicDemo = (size: number, temp: number, atmos: number): string => {
  const myLibrary = new gmgen.GeneratorLibrary(data);

  const myGenerator = new gmgen.Generator(myLibrary);

  // Check the Console to see detailed Generator logs
  myGenerator.SetOption('Logging', gmgen.logLevel.debug);

  const template = `<div class="text-2xl">^%name%</div><hr/><p>^{%small%:${
    100 - size
  }|^%big%:${size}}</p><p>^{%hot%:${
    100 - temp
  }|^%cold%:${temp}}</p><p>^{%uninhabitable%:${
    100 - atmos
  }|^%inhabitable%:${atmos}}</p>`;

  return myGenerator.Generate(template);
};

export default dynamicDemo;
