import gmgen from '../../../dist/src';

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

  const myGenerator = new gmgen.Generator(myLibrary, {
    Logging: 'debug',
  });

  return myGenerator.Generate(template);
};

export default interactiveDemo;
