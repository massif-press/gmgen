import { Generator } from '../../lib/generator';
import GeneratorLibrary from '../../lib/generatorLibrary';
import LibraryData from '../../lib/libraryData';

const interactiveDemo = (
  data: { value: string; weight: number }[],
  template: string
): string => {
  const myLibrary = new GeneratorLibrary();
  myLibrary.AddData({
    key: 'newLibrary',
    values: {
      treasure: data,
    },
  });

  const myGenerator = new Generator(myLibrary, {
    Logging: 'verbose',
  });

  return myGenerator.Generate(template);
};

export default interactiveDemo;
