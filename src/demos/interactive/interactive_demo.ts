import * as gmgen from 'gmgen';

const interactiveDemo = (
  data: { value: string; weight: number }[],
  template: string
): string => {
  const myLibrary = new gmgen.GeneratorLibrary();
  myLibrary.AddData({
    key: 'newLibrary',
    values: {
      treasure: data,
    },
  });

  const myGenerator = new gmgen.Generator(myLibrary);

  // Check the Console to see detailed Generator logs
  myGenerator.SetOption('Logging', gmgen.logLevel.debug);

  return myGenerator.Generate(template);
};

export default interactiveDemo;
