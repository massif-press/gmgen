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
const libraryData_1 = __importDefault(require("../libraryData"));
const util = __importStar(require("../util"));
const testLibraryData_1 = require("./__testData__/testLibraryData");
describe('constructor', () => {
    const ld = new libraryData_1.default('test');
    it('should initialize an empty LibraryData', () => {
        expect(ld.key).toStrictEqual('test');
        expect(ld.definitions).toStrictEqual({});
        expect(ld.values).toStrictEqual({});
        expect(ld.templates).toStrictEqual([]);
    });
});
describe('Convert', () => {
    const clogSpy = jest.spyOn(util, 'cLog');
    it('should throw an error on keyless or non-JSON data', () => {
        expect(() => libraryData_1.default.Convert(testLibraryData_1.keylessData)).toThrowError();
        expect(() => libraryData_1.default.Convert(JSON.stringify(testLibraryData_1.keylessData))).toThrowError();
        expect(() => libraryData_1.default.Convert('bad json')).toThrowError();
        expect(clogSpy).toHaveBeenCalled();
    });
    it('should convert keyed data and valid JSON', () => {
        expect(() => libraryData_1.default.Convert(testLibraryData_1.testData)).not.toThrowError();
        expect(libraryData_1.default.Convert(testLibraryData_1.testData)).toStrictEqual(libraryData_1.default.Convert(JSON.stringify(testLibraryData_1.testData)));
    });
    const ld = libraryData_1.default.Convert(testLibraryData_1.testData);
    it('should preserve all keyed values', () => {
        expect(ld.values).to.include.keys('string_val', 'weighted_arr_sel');
    });
    it('should return an empty set for empty values', () => {
        expect(ld.values['empty_set'][0]).to.have.property('value').that.equals('');
    });
    it('should preserve ValueItem values', () => {
        expect(ld.values['string_val'][0])
            .to.have.property('value')
            .that.equals('solo string val');
    });
    it('should preserve ValueItem weights', () => {
        expect(ld.values['string_val'][0])
            .to.have.property('weight')
            .that.equals(1);
    });
    it('should convert ValueItem values as strings', () => {
        expect(ld.values['weighted_arr_sel'][0])
            .to.have.property('value')
            .that.is.a('string');
    });
    it('should convert ValueItem weights as numbers', () => {
        expect(ld.values['weighted_arr_sel'][0])
            .to.have.property('weight')
            .that.is.a('number');
    });
});
describe('Define', () => {
    const clogSpy = jest.spyOn(util, 'cLog');
    const ld = new libraryData_1.default('ld');
    it('should set a keyed definition', () => {
        ld.Define('hello', 'world');
        expect(ld.definitions).includes({ hello: 'world' });
    });
    it('should delete a keyed definition', () => {
        ld.ClearDefinition('hello');
        expect(ld.definitions).toStrictEqual({});
    });
    it('should throw an error if asked to delete a missing definition', () => {
        expect(() => ld.ClearDefinition('foo')).toThrowError();
        expect(clogSpy).toHaveBeenCalled();
    });
});
describe('Templates', () => {
    const clogSpy = jest.spyOn(util, 'cLog');
    const ld = new libraryData_1.default('ld');
    it('should add templates passed as args', () => {
        ld.AddTemplate('foo', 'bar');
        expect(ld.templates.length).toBe(2);
        ld.AddTemplate('baz', 'buzz');
        expect(ld.templates.length).toBe(4);
    });
    it('should throw an error if asked to set a missing template', () => {
        expect(() => ld.SetTemplate(999, 'yuck')).toThrowError();
        expect(clogSpy).toHaveBeenCalled();
    });
    it('should change a template based on index', () => {
        ld.SetTemplate(0, 'changed');
        expect(ld.templates[0]).toBe('changed');
    });
    it('should throw an error if asked to remove a template beyond index bounds', () => {
        expect(() => ld.RemoveTemplate(998)).toThrowError();
        expect(clogSpy).toHaveBeenCalled();
    });
    it('should throw an error if asked to remove a template at a bad index', () => {
        expect(() => ld.RemoveTemplate(0.452)).toThrowError();
        expect(clogSpy).toHaveBeenCalled();
    });
    it('should remove templates by index', () => {
        ld.RemoveTemplate(1);
        expect(ld.templates[1]).toBe('baz');
    });
    it('should clear all templates', () => {
        ld.ClearTemplates();
        expect(ld.templates).toStrictEqual([]);
    });
});
describe('Values', () => {
    const ld = new libraryData_1.default('ld');
    it('should convert ValueItems on AddValue', () => {
        ld.AddValue('test', 'first value');
        expect(Object.keys(ld.values).length).toBe(1);
        expect(ld.values['test'].length).toBe(1);
        expect(ld.values['test'][0].weight).toBe(1);
    });
    it('should merge ValueItems under the same key', () => {
        ld.AddValue('test', 'second value:3');
        expect(ld.values['test'].length).toBe(2);
        expect(ld.values['test'][1].weight).toBe(3);
    });
    it('should return only converted ValueItems', () => {
        expect(ld.GetValue('test').length).toBe(2);
        expect(ld.GetValue('test')[0].value).toBe('first value');
    });
    it('should throw an error when asked to get a missing ValueItem', () => {
        expect(() => ld.GetValue('gross')).toThrowError();
    });
    it('should clear all value weights under specific key', () => {
        ld.ClearValueWeights('test');
        expect(ld.values['test'][1].weight).toBe(1);
    });
    it('should clear all values under specific key', () => {
        ld.ClearValue('test');
        expect(ld.GetValue('test').length).toBe(1);
        expect(ld.GetValue('test')[0].value).toBe('');
        expect(() => ld.GetValue('gross')).toThrowError();
    });
    it('should completely delete value at specific key', () => {
        ld.DeleteValue('test');
        expect(ld.values).toStrictEqual({});
        expect(() => ld.GetValue('test')).toThrowError();
    });
});
describe('ValueItems', () => {
    const ld = new libraryData_1.default('ld');
    it('should add a ValueItem to an existing key', () => {
        ld.AddValue('test', 'item 1');
        expect(ld.values['test'].length).toBe(1);
        ld.AddValueItem('test', 'item 2');
        expect(ld.values['test'].length).toBe(2);
    });
    it('should set an existing ValueItem of key at index', () => {
        ld.SetValueItem('test', 0, 'changed');
        expect(ld.values['test'][0].value).toBe('changed');
    });
    it("should set an existing ValueItem's weight", () => {
        expect(ld.values['test'][1].weight).toBe(1);
        ld.SetValueItemWeight('test', 1, 5);
        expect(ld.values['test'][1].weight).toBe(5);
    });
    it('should completely delete a ValueItem of key at index', () => {
        ld.DeleteValueItem('test', 0);
        expect(ld.values['test'].length).toBe(1);
        expect(ld.values['test'][0].value).toBe('item 2');
        expect(ld.values['test'][0].weight).toBe(5);
    });
    it('should reset a ValueItem of key at index', () => {
        ld.ClearValueItem('test', 0);
        expect(ld.values['test'][0].value).toBe('');
        expect(ld.values['test'][0].weight).toBe(1);
    });
});
describe('PrepValues', () => {
    const clogSpy = jest.spyOn(util, 'cLog');
    let values = ['a:99', 'b', 'c', 'e', 'f', 'g'];
    let weights = [1, 2, 3];
    let out = libraryData_1.default.PrepValues(values, weights);
    it('should prepare all values', () => {
        expect(out.length).toBe(values.length);
    });
    it('should overwrite syntactical weights with explicit weights', () => {
        expect(out[0].weight).toBe(1);
    });
    it('should overwrite default weights with explicit weights', () => {
        expect(out[1].weight).toBe(2);
    });
    it('should interpret single weight param as an array of length 1', () => {
        values = ['a', 'b', 'c', 'e', 'f', 'g'];
        out = libraryData_1.default.PrepValues(values, 7);
        expect(out.length).toBe(values.length);
        expect(out[0].weight).toBe(7);
    });
    it('should automatically assign default weights without weight parameter', () => {
        out = libraryData_1.default.PrepValues(values);
        expect(out.length).toBe(values.length);
        expect(out[0].weight).toBe(1);
    });
    it('should automatically assign syntactical weights without weight parameter', () => {
        values = ['a:5', 'b:7', 'c:9'];
        out = libraryData_1.default.PrepValues(values);
        expect(out.length).toBe(values.length);
        expect(out[1].weight).toBe(7);
    });
    it('should ignore non-integer syntactical weights', () => {
        let newValues = [
            { value: 'v1', weight: 2 },
            { value: 'v2', weight: 3 },
            { value: 'v3' },
        ];
        out = libraryData_1.default.PrepValues(newValues, [99, 0.225]);
        expect(out.length).toBe(newValues.length);
        expect(out[2].weight).toBe(1);
    });
    it('should throw an error when passed bad value data', () => {
        const badValues = [{}, {}];
        expect(() => libraryData_1.default.PrepValues(badValues)).toThrowError();
        expect(clogSpy).toHaveBeenCalled();
    });
});
describe('SplitValueWeights', () => {
    it('should split value/weight pairs on val:weight syntax', () => {
        let values = ['a:99', 'b:11', 'c'];
        let out = libraryData_1.default.SplitValueWeights(values);
        expect(out).toStrictEqual([
            ['a', 'b', 'c'],
            [99, 11, 1],
        ]);
    });
});
