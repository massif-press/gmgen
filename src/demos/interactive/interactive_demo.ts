import * as gmgen from 'gmgen';

const interactiveDemo = (
  data: { value: string; weight: number }[],
  template: string
): string => {
  const myGenerator = new gmgen.Generator();
  myGenerator.AddData({
    key: 'newLibrary',
    values: {
      treasure: data,
    },
  });

  // Check the Console to see detailed Generator logs
  myGenerator.SetOption('Logging', gmgen.logLevel.debug);

  return myGenerator.Generate(template);
};

export default interactiveDemo;
