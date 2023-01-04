import { Generator } from '../../lib/generator';
import GeneratorLibrary from '../../lib/generatorLibrary';

const dynamicDemo = (data: {
  subject: string[];
  location: string[];
  vibe: string[];
}): string => {
  const myGenerator = new Generator();

  for (const key in data) {
    myGenerator.AddValueMap(key, data[key]);
  }

  const myTemplate = '^%subject%^ in %location% with a %vibe% vibe';

  return myGenerator.Generate(myTemplate);
};

export default dynamicDemo;
