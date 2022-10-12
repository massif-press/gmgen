import { Generator } from '../lib/generator';
import GeneratorLibrary from '../lib/generatorLibrary';
import LibraryData from '../lib/libraryData';
import * as util from '../lib/util';
import { testData } from './__testData__/testLibraryData';

let clogSpy = vi.spyOn(util, 'cLog');

beforeEach(() => {
  clogSpy = vi.spyOn(util, 'cLog');
});

describe('Generator constructor', () => {
  let g = new Generator();
  it('should not automatically initialize a library', () => {
    expect(g.Library).to.not.exist;
  });

  it('should initialize a provided library', () => {
    g = new Generator(new GeneratorLibrary());
    expect(g.Library).to.exist;
  });

  it('should load a provided options', () => {
    g = new Generator(null, {
      CleanMultipleSpaces: true,
      CapitalizeFirst: true,
      IgnoreMissingKeys: true,
      MaxIterations: 100,
      CleanEscapes: true,
      Logging: 'errors only',
    });
    expect(g.Library).to.not.exist;
  });

  it('should set both a library and options', () => {
    g = new Generator(new GeneratorLibrary(), {
      CleanMultipleSpaces: true,
      CapitalizeFirst: true,
      IgnoreMissingKeys: true,
      MaxIterations: 100,
      CleanEscapes: true,
      Logging: 'errors only',
    });
    expect(g.Library).to.exist;
  });
});

describe('Generate (failure)', () => {
  const g = new Generator();

  it('should fail without a library', () => {
    expect(() => g.Generate()).toThrowError();
    expect(clogSpy).toHaveBeenCalled();
  });
});

describe('Generate', () => {
  const g = new Generator();
  const dataLib = new GeneratorLibrary(LibraryData.Convert(testData));

  g.LoadLibrary(dataLib);
  let output = g.Generate();

  it('should execute with a library', () => {
    expect(output.length).toBeGreaterThan(0);
  });

  it('should execute with a provided template string', () => {
    output = g.Generate('template2');
    expect(output).toBe('template2');
  });

  it('should execute with a provided template string array', () => {
    output = g.Generate(['a', 'b']);
    expect(output).to.be.oneOf(['a', 'b']);
  });

  it('should execute with a provided templateItem interface object', () => {
    output = g.Generate({ templates: ['template2'] });
    expect(output).toBe('template2');
  });

  it('should throw an error when provided a bad template object', () => {
    expect(() => g.Generate({ foo: 'bar' } as any)).toThrowError();
  });
  it('should finish without defining a missing keyword', () => {
    g.SetOption('IgnoreMissingKeys', false);
    output = g.Generate('%missing_value%');
    expect(output).toBe('%missing_value%');
  });

  it('should process an inline selection set', () => {
    output = g.Generate('%arr_sel|weighted_arr_sel%');
    expect(output).to.include('arr');
  });

  it('should assign and render a syntactical keyword', () => {
    output = g.Generate('@akey{a} %akey%');
    expect(output).toBe('a a');
  });

  it('should assign and render a syntactical keyword selection set', () => {
    output = g.Generate('@sk%string_val% %sk%');
    expect(output).toBe('solo string val solo string val');
  });

  it('should correctly process @pct directive', () => {
    let count = 0;
    const iterations = 100;
    for (let i = 0; i < iterations; i++) {
      output = g.Generate(`@pct50{${i}}`);
      if (output) count++;
    }
    console.log(`expected: ${iterations / 2}, actual: ${count}`);
    expect(count).to.be.approximately(iterations / 2, iterations / 5);
  });
});

describe('Define', () => {
  let g = new Generator(new GeneratorLibrary());
  it('should set an empty definition', () => {
    g.Define('hello', 'world');
    expect(g.Generate('%hello%')).toBe('world');
  });

  it('should not overwrite a set definition', () => {
    g.Define('hello', 'changed');
    expect(g.Generate('%hello%')).toBe('world');
  });
});

describe('ValueMaps', () => {
  let g = new Generator(new GeneratorLibrary());
  g.SetValueMap('test', [
    { value: 'hello', weight: 2 },
    { value: 'world', weight: 2 },
  ]);

  it('SetValueMap should supply generation', () => {
    expect(g.Generate('%test%')).to.be.oneOf(['hello', 'world']);
  });

  it('HasValueMap should find an existing ValueMap', () => {
    expect(g.HasValueMap('test')).toBe(true);
  });

  it('HasValueMap should not find a missing ValueMap', () => {
    expect(g.HasValueMap('foo')).toBe(false);
  });

  it('GetValueMap should return a defined ValueMap', () => {
    expect(g.GetValueMap('test').length).toBe(2);
  });

  it('GetValueMap should return an empty array for a missing ValueMap', () => {
    expect(g.GetValueMap('foo')).toStrictEqual([]);
  });

  it('DeleteValueMap should clear a ValueMap', () => {
    g.DeleteValueMap('test');
    expect(g.GetValueMap('test')).toStrictEqual([]);
  });
});

describe('Capitalization Syntax', () => {
  let g = new Generator(new GeneratorLibrary());

  it('should capitalize the first letter on one carat', () => {
    expect(g.Generate('^{hello world}')).toBe('Hello world');
  });

  it('should capitalize all words on two carats', () => {
    expect(g.Generate('^^{hello world}')).toBe('Hello World');
  });

  it('should capitalize all letters on three carats', () => {
    expect(g.Generate('^^^{hello world}')).toBe('HELLO WORLD');
  });

  it('should ignore words not in syntax', () => {
    expect(g.Generate('^hello')).toBe('hello');
  });
});

describe('Render Options', () => {
  let g = new Generator(new GeneratorLibrary());

  it('should remove extra capitalization carats', () => {
    expect(g.Generate('^hello')).toBe('hello');
  });

  it('should not remove escaped carats', () => {
    expect(g.Generate('`^hello')).toBe('^hello');
  });

  it('CleanEscapes = false should ignore escapes', () => {
    g.SetOption('CleanEscapes', false);
    expect(g.Generate('`^hello')).toBe('`^hello');
  });

  it('CleanEscapes = true should remove escapes', () => {
    g.SetOption('CleanEscapes', true);
    expect(g.Generate('`hello')).toBe('hello');
  });

  it('CleanMultipleSpaces = false should ignore multiple spaces', () => {
    g.SetOption('CleanMultipleSpaces', false);
    expect(g.Generate('hello     world')).toBe('hello     world');
  });

  it('CleanMultipleSpaces = true should remove multiple spaces', () => {
    g.SetOption('CleanMultipleSpaces', true);
    expect(g.Generate('hello     world')).toBe('hello world');
  });

  it('IgnoreMissingKeys = true should remove missing keys', () => {
    g.SetOption('IgnoreMissingKeys', true);
    expect(g.Generate('%hello%')).toBe('');
  });

  it('IgnoreMissingKeys = false should ignore missing keys', () => {
    g.SetOption('IgnoreMissingKeys', false);
    expect(g.Generate('%hello%')).toBe('%hello%');
  });

  it('Logging = "none" should switch logging mode to none', () => {
    g.SetOption('Logging', 'none');
    g.Generate('hello %world%');
    expect(clogSpy).toHaveBeenCalledTimes(0);
  });

  it('Logging = "errors only" should switch logging mode to errors only', () => {
    g.SetOption('Logging', 'errors only');
    g.Generate('hello %world%');
    expect(clogSpy).toHaveBeenCalledTimes(1);
  });

  it('Logging = "verbose" should switch logging mode to verbose', () => {
    g.SetOption('Logging', 'verbose');
    g.Generate('hello world');
    expect(clogSpy).toHaveBeenCalledTimes(1);
  });
});

describe('FindMissingValues', () => {
  let g = new Generator(new GeneratorLibrary());

  it('should find missing values', () => {
    const missing = g.FindMissingValues('hello %world%');
    expect(missing).toStrictEqual(['Unresolvable Set Selection: %world%']);
  });

  it('should not find non-missing values', () => {
    g.AddValueMap('world', [{ value: 'world', weight: 1 }]);
    const missing = g.FindMissingValues('hello %world%');
    expect(missing).toStrictEqual([]);
  });
});

describe('OverlappingDefinition', () => {
  it('should pass alert on overlapping definition', () => {
    let g = new Generator(
      new GeneratorLibrary(
        new LibraryData('a', { test: 'hello' }),
        new LibraryData('b', { test: 'world' })
      )
    );
    const od = g.OverlappingDefinitions();
    expect(od).toHaveLength(1);
    expect(od[0]).toBe('ALERT: overlapping definition at key "test"');
  });

  it('should pass warning on overlapping definition of different cases', () => {
    let g = new Generator(
      new GeneratorLibrary(
        new LibraryData('a', { test: 'hello' }),
        new LibraryData('b', { Test: 'world' })
      )
    );
    const od = g.OverlappingDefinitions();
    expect(od).toHaveLength(1);
    expect(od[0]).toBe(
      'Warning: key "Test" already exists, but in a different case. This will not cause an overlap but may be confusing.'
    );
  });
});

describe('Step', () => {
  let g = new Generator(new GeneratorLibrary());

  it('should only execute one process step', () => {
    let out = g.Step('hello @k{world} %k%');
    expect(out).toBe('hello world {world}');
    out = g.Step(out);
    expect(out).toBe('hello world world');
  });
});
