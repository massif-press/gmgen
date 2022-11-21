import { Generator } from '../../lib/generator';
import GeneratorLibrary from '../../lib/generatorLibrary';
import * as data from './data';

const dynamicDemo = (size: number, temp: number, atmos: number): string => {
  const myLibrary = new GeneratorLibrary(data);

  const myGenerator = new Generator(myLibrary);

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
