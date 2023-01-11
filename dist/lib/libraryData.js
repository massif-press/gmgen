"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const lodash_1 = __importDefault(require("lodash"));
class LibraryData {
    constructor(key, definitions, values, templates) {
        this.key = key;
        this.definitions = definitions || {};
        this.values = values || {};
        this.templates = templates || [];
    }
    static Convert(json) {
        let c;
        try {
            c = typeof json === 'string' ? JSON.parse(json) : json;
        }
        catch (error) {
            (0, util_1.cLog)(1, `Error converting object to LibraryData: item is not valid JSON`);
            throw new Error(`${json}`);
        }
        if (!c.key) {
            (0, util_1.cLog)(1, `Error converting object to LibraryData: item lacks key property`);
            throw new Error(`object has no key field: ${c}`);
        }
        return new LibraryData(c.key, c.definitions, this.prepValueObject(c.values), c.templates);
    }
    static prepValueObject(obj) {
        const out = {};
        for (const k in obj) {
            out[k] = LibraryData.PrepValues(obj[k]);
        }
        return out;
    }
    Define(key, value) {
        if (!this.definitions[key])
            this.definitions[key] = value;
    }
    ClearDefinition(key) {
        this.checkKey(key, 'definitions');
        delete this.definitions[key];
    }
    AddTemplate(...values) {
        this.templates = [...this.templates, ...values];
    }
    SetTemplate(index, value) {
        this.checkIndex(index, 'templates');
        this.templates[index] = value;
    }
    RemoveTemplate(index) {
        this.checkIndex(index, 'templates');
        this.templates.splice(index, 1);
    }
    ClearTemplates() {
        this.templates.splice(0, this.templates.length);
    }
    GetValue(key) {
        this.checkKey(key, 'values');
        return this.values[key];
    }
    AddValue(key, value, weight) {
        if (this.values[key])
            this.values[key] = [
                ...this.values[key],
                ...LibraryData.PrepValues(value, weight),
            ];
        else
            this.SetValue(key, value, weight);
    }
    SetValue(key, value, weight) {
        this.values[key] = LibraryData.PrepValues(value, weight);
    }
    DeleteValue(key) {
        this.checkKey(key, 'values');
        delete this.values[key];
    }
    ClearValue(key) {
        this.checkKey(key, 'values');
        this.values[key] = [{ value: '', weight: 1 }];
    }
    ClearValueWeights(key) {
        this.checkKey(key, 'values');
        this.values[key].forEach((v) => {
            v.weight = 1;
        });
    }
    AddValueItem(key, value, weight = 1) {
        this.values[key].push({
            value,
            weight,
        });
    }
    SetValueItem(key, index, value, weight = 1) {
        this.checkKey(key, 'values');
        this.checkIndex(index, `values.${key}`);
        this.values[key][index] = {
            value,
            weight,
        };
    }
    SetValueItemWeight(key, index, weight) {
        this.checkKey(key, 'values');
        this.checkIndex(index, `values.${key}`);
        this.values[key][index].weight = weight;
    }
    DeleteValueItem(key, index) {
        this.checkKey(key, 'values');
        this.checkIndex(index, `values.${key}`);
        this.values[key].splice(index, 1);
    }
    ClearValueItem(key, index) {
        this.checkKey(key, 'values');
        this.checkIndex(index, `values.${key}`);
        this.values[key][index].value = '';
        this.values[key][index].weight = 1;
    }
    static PrepValues(values, weights) {
        let v, w;
        if (!values)
            return [];
        if (Array.isArray(values) && !values[0])
            return [];
        if (typeof values === 'string')
            values = values.replace(/[{}]/g, '').split('|');
        if (typeof values[0] === 'string') {
            v = values;
            w = [];
            [v, w] = this.SplitValueWeights(v);
            if (weights) {
                const wArr = Array.isArray(weights) ? weights : [weights];
                for (let i = 0; i < wArr.length; i++) {
                    w[i] = wArr[i];
                }
            }
        }
        else if (Array.isArray(values[0])) {
            v = values.map((x) => x[0]);
            w = values.map((x) => x[1] || 1);
        }
        else if (values[0].value !== undefined) {
            v = values.map((x) => x.value);
            w = values.map((x) => x.weight || 1);
        }
        else {
            (0, util_1.cLog)(1, 'Inappropriate or malformed value item detected');
            throw new Error(values);
        }
        return v.map((x, i) => ({
            value: x,
            weight: w[i],
        }));
    }
    static SplitValueWeights(arr) {
        let values = [];
        let weights = [];
        arr.forEach((str) => {
            // capture :number, ignore escape
            const match = str.match(/(?<!\\)(?:\:)\d+/);
            if (match && match[0]) {
                weights.push(Number(match[0].replace(':', '')));
                values.push(str.replace(match[0], ''));
            }
            else {
                weights.push(1);
                values.push(str);
            }
        });
        return [values, weights];
    }
    checkIndex(index, arrKey) {
        if (!Number.isInteger(index)) {
            (0, util_1.cLog)(1, `Error setting ${arrKey}: inappropriate index value`);
            throw new Error(`${index} cannot be used as index`);
        }
        if (index > lodash_1.default.property(`this.${arrKey}`).length || index < 0) {
            (0, util_1.cLog)(1, `Error setting ${arrKey}: index exceeds array bounds`);
            throw new Error(`Index ${index} exceeds array bounds of 0-${lodash_1.default.property(`this.${arrKey}`).length}`);
        }
    }
    checkKey(key, objKey) {
        if (!lodash_1.default.has(this, `${objKey}.${key}`)) {
            (0, util_1.cLog)(1, `Error clearing ${objKey}: LibraryData contains no ${objKey} for ${key}`, `📙`);
            throw new Error(`LibraryData is undefined at ${objKey}.${key}`);
        }
    }
}
exports.default = LibraryData;
