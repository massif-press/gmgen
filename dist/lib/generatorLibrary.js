"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const libraryData_1 = __importDefault(require("./libraryData"));
const util_1 = require("./util");
class GeneratorLibrary {
    constructor(libraryData) {
        this._content = [];
        if (libraryData) {
            if (Array.isArray(libraryData)) {
                libraryData.map((x) => {
                    this.AddData(x);
                });
            }
            else if (libraryData.key) {
                this.AddData(libraryData);
            }
            else if (libraryData[Object.keys(libraryData)[0]].key) {
                for (const key in libraryData) {
                    this.AddData(libraryData[key]);
                }
            }
        }
    }
    get Content() {
        return this._content;
    }
    HasLibrary(key) {
        const k = this.getKeyStr(key);
        if (k)
            return this.contentIndex(k) > -1;
        (0, util_1.cLog)(1, 'Bad parameter passed to Library.HasLibrary', '📙');
        throw new Error(`${key} is not string or LibraryData`);
    }
    GetLibrary(key) {
        const k = this.getKeyStr(key);
        this.checkExists(k);
        return this._content[this.contentIndex(k)];
    }
    AddData(data) {
        if (!data.key) {
            (0, util_1.cLog)(1, 'Item passed to Library has no key', '📙');
            throw new Error(`${data} does not include key field`);
        }
        if (this.HasLibrary(data))
            this.mergeData(data);
        else
            this.SetData(data);
    }
    SetData(data) {
        this._content.push(libraryData_1.default.Convert(data));
    }
    DeleteData(key) {
        const k = this.getKeyStr(key);
        this.checkExists(k);
        this._content.splice(this.contentIndex(k), 1);
    }
    contentIndex(k) {
        return this._content.findIndex((x) => x.key === k);
    }
    mergeData(newData) {
        const oldData = this._content[this.contentIndex(newData.key)];
        const merged = new libraryData_1.default(newData.key, { ...newData.definitions, ...oldData.definitions }, oldData.values, [...oldData.templates, ...newData.templates]);
        for (const k in newData.values) {
            merged.AddValue(k, newData.values[k]);
        }
        this._content[this.contentIndex(newData.key)] = merged;
    }
    getKeyStr(key) {
        return typeof key === 'string' ? key : key.key;
    }
    checkExists(key) {
        if (!this.HasLibrary(key)) {
            (0, util_1.cLog)(1, 'Error deleting LibraryData: LibraryData of key ${key} not found in library', '📙');
            throw new Error(`${key} not found`);
        }
    }
}
exports.default = GeneratorLibrary;
