import { Generator } from '../../lib/generator';
import GeneratorLibrary from '../../lib/generatorLibrary';

const dynamicDemo = (
  subjects: string[],
  locations: string[],
  vibes: string[]
): string => {
  const myLibrary = new GeneratorLibrary();
  myLibrary.AddData({
    key: 'newLibrary',
    values: {
      subject: subjects,
      location: locations,
      vibe: vibes,
    },
  });

  const myGenerator = new Generator(myLibrary);

  const myTemplate = '^%subject% in %location% with a %vibe% vibe';

  return myGenerator.Generate(myTemplate);
};

export default dynamicDemo;
