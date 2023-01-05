"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generatorLibrary_1 = __importDefault(require("../generatorLibrary"));
const libraryData_1 = __importDefault(require("../libraryData"));
const util = __importStar(require("../util"));
const testLibraryData_1 = require("./__testData__/testLibraryData");
describe('constructor', () => {
    const goodData = new libraryData_1.default('test');
    const badData = new libraryData_1.default(null);
    it('should load good data', () => {
        expect(() => new generatorLibrary_1.default(goodData)).not.toThrowError();
    });
    it('should throw an error on loading bad data', () => {
        expect(() => new generatorLibrary_1.default(badData)).toThrowError();
    });
    it('should load data arrays', () => {
        expect(() => new generatorLibrary_1.default([goodData, goodData, goodData])).not.toThrowError();
    });
    it('should add any data object with a key property', () => {
        const weirdData = {
            key: 'hello',
            values: ['world'],
        };
        expect(() => new generatorLibrary_1.default(weirdData)).not.toThrowError();
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
        expect(() => new generatorLibrary_1.default(weirdDataObj)).not.toThrowError();
    });
});
describe('Content', () => {
    const data = libraryData_1.default.Convert(testLibraryData_1.testData);
    const lib = new generatorLibrary_1.default(data);
    it('should expose loaded data', () => {
        expect(lib.Content.length).toBe(1);
        expect(lib.Content[0]).to.eql(data);
    });
});
describe('Libraries', () => {
    const clogSpy = jest.spyOn(util, 'cLog');
    const data = libraryData_1.default.Convert(testLibraryData_1.testData);
    const lib = new generatorLibrary_1.default(data);
    it('HasLibrary should return true for existing library', () => {
        expect(lib.HasLibrary(data)).toBe(true);
        expect(lib.HasLibrary(data.key)).toBe(true);
    });
    it('HasLibrary should return false for missing library', () => {
        expect(lib.HasLibrary('foo')).toBe(false);
    });
    it('HasLibrary should throw an error when passed a bad parameter', () => {
        expect(() => lib.HasLibrary({})).toThrowError();
        expect(clogSpy).toHaveBeenCalled();
    });
    it('GetLibrary should return exactly the data requested', () => {
        expect(lib.GetLibrary(data.key)).to.eql(data);
        expect(lib.GetLibrary({ key: data.key })).to.eql(data);
        expect(lib.GetLibrary(data)).to.eql(data);
    });
});
describe('Data', () => {
    const clogSpy = jest.spyOn(util, 'cLog');
    const lib = new generatorLibrary_1.default();
    lib.AddData(new libraryData_1.default('test', { def1: 'def1' }, { val1: 'val1' }, ['template1']));
    it('AddData should add data to Library', () => {
        expect(lib.Content.length).toBe(1);
    });
    it('AddData should add a definition to Library', () => {
        expect(Object.keys(lib.Content[0].definitions).length).toBe(1);
        lib.AddData(new libraryData_1.default('test', { def2: 'def2' }));
        expect(lib.Content.length).toBe(1);
        expect(Object.keys(lib.Content[0].definitions).length).toBe(2);
    });
    it('should not overwrite existing definitions', () => {
        lib.AddData(new libraryData_1.default('test', { def2: 'changed' }));
        expect(lib.Content['0'].definitions['def2']).toBe('def2');
    });
    it('should merge values based on key', () => {
        expect(Object.keys(lib.Content[0].values).length).toBe(1);
        lib.AddData(new libraryData_1.default('test', {}, { val1: 'val1_b', val2: 'val2' }, []));
        expect(Object.keys(lib.Content[0].values).length).toBe(2);
    });
    it('should merge templates', () => {
        expect(lib.Content[0].templates.length).toBe(1);
        lib.AddData(new libraryData_1.default('test', { def3: 'def3' }, { val3: 'val3' }, ['template2']));
        expect(lib.Content[0].templates.length).toBe(2);
    });
    it('should add new data under a new key', () => {
        lib.AddData(new libraryData_1.default('newkey'));
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
        lib.DeleteData({ key: 'newkey' });
        expect(lib.Content.length).toBe(1);
    });
});
