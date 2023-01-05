import gmgen from '../../../dist/src';

const dynamicDemo = (data: {
  subject: string[];
  location: string[];
  vibe: string[];
}): string => {
  const myGenerator = new gmgen.Generator();

  // Check the Console to see detailed Generator logs
  myGenerator.SetOption('Logging', gmgen.logLevel.debug);

  for (const key in data) {
    myGenerator.AddValueMap(key, data[key]);
  }

  const myTemplate = '^%subject%^ in %location% with a %vibe% vibe';

  return myGenerator.Generate(myTemplate);
};

export default dynamicDemo;
