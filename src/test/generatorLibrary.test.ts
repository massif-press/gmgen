import GeneratorLibrary from '../lib/generatorLibrary';
import LibraryData from '../lib/libraryData';
import * as util from '../lib/util';
import { testData } from './__testData__/testLibraryData';

describe('constructor', () => {
  const goodData = new LibraryData('test');
  const badData = new LibraryData(null as unknown as string);

  it('should load good data', () => {
    expect(() => new GeneratorLibrary(goodData)).not.toThrowError();
  });

  it('should throw an error on loading bad data', () => {
    expect(() => new GeneratorLibrary(badData)).toThrowError();
  });

  it('should load data arrays', () => {
    expect(
      () => new GeneratorLibrary([goodData, goodData, goodData])
    ).not.toThrowError();
  });

  it('should add any data object with a key property', () => {
    const weirdData = {
      key: 'hello',
      values: ['world'],
    };
    expect(() => new GeneratorLibrary(weirdData)).not.toThrowError();
  });

  it('should load keyed data in an enclosing object', () => {
    const weirdDataObj = {
      hello: {
        key: 'k1',
        values: ['d1'],
      },
      world: {
        key: 'k2',
        values: ['d2'],
      },
    };
    expect(() => new GeneratorLibrary(weirdDataObj)).not.toThrowError();
  });
});

describe('Content', () => {
  const data = LibraryData.Convert(testData);
  const lib = new GeneratorLibrary(data);
  it('should expose loaded data', () => {
    expect(lib.Content.length).toBe(1);
    expect(lib.Content[0]).to.eql(data);
  });
});

describe('Libraries', () => {
  const clogSpy = vi.spyOn(util, 'cLog');
  const data = LibraryData.Convert(testData);
  const lib = new GeneratorLibrary(data);

  it('HasLibrary should return true for existing library', () => {
    expect(lib.HasLibrary(data)).toBe(true);
    expect(lib.HasLibrary(data.key)).toBe(true);
  });

  it('HasLibrary should return false for missing library', () => {
    expect(lib.HasLibrary('foo')).toBe(false);
  });

  it('HasLibrary should throw an error when passed a bad parameter', () => {
    expect(() => lib.HasLibrary({} as LibraryData)).toThrowError();
    expect(clogSpy).toHaveBeenCalled();
  });

  it('GetLibrary should return exactly the data requested', () => {
    expect(lib.GetLibrary(data.key)).to.eql(data);
    expect(lib.GetLibrary({ key: data.key } as LibraryData)).to.eql(data);
    expect(lib.GetLibrary(data)).to.eql(data);
  });
});

describe('Data', () => {
  const clogSpy = vi.spyOn(util, 'cLog');
  const lib = new GeneratorLibrary();
  lib.AddData(
    new LibraryData('test', { def1: 'def1' }, { val1: 'val1' }, ['template1'])
  );
  it('AddData should add data to Library', () => {
    expect(lib.Content.length).toBe(1);
  });

  it('AddData should add a definition to Library', () => {
    expect(Object.keys(lib.Content[0].definitions).length).toBe(1);
    lib.AddData(new LibraryData('test', { def2: 'def2' }));
    expect(lib.Content.length).toBe(1);
    expect(Object.keys(lib.Content[0].definitions).length).toBe(2);
  });

  it('should not overwrite existing definitions', () => {
    lib.AddData(new LibraryData('test', { def2: 'changed' }));
    expect(lib.Content['0'].definitions['def2']).toBe('def2');
  });

  it('should merge values based on key', () => {
    expect(Object.keys(lib.Content[0].values).length).toBe(1);
    lib.AddData(
      new LibraryData('test', {}, { val1: 'val1_b', val2: 'val2' }, [])
    );
    expect(Object.keys(lib.Content[0].values).length).toBe(2);
  });

  it('should merge templates', () => {
    expect(lib.Content[0].templates.length).toBe(1);
    lib.AddData(
      new LibraryData('test', { def3: 'def3' }, { val3: 'val3' }, ['template2'])
    );
    expect(lib.Content[0].templates.length).toBe(2);
  });

  it('should add new data under a new key', () => {
    lib.AddData(new LibraryData('newkey'));
    expect(lib.Content.length).toBe(2);
  });

  it('should throw an error if asked to delete missing data', () => {
    expect(() => lib.DeleteData('foo')).toThrowError();
    expect(clogSpy).toHaveBeenCalled();
  });

  it('should throw an error if asked to add malformed data', () => {
    expect(() => lib.AddData('bad data')).toThrowError();
    expect(clogSpy).toHaveBeenCalled();
  });

  it('should completely remove deleted data', () => {
    lib.DeleteData({ key: 'newkey' } as LibraryData);
    expect(lib.Content.length).toBe(1);
  });
});
