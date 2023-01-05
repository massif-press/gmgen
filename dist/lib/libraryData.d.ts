import { ValueItem } from './generator';
declare class LibraryData {
    key: string;
    definitions: object;
    values: object;
    templates: string[];
    constructor(key: string, definitions?: object, values?: object, templates?: string[]);
    static Convert(json: string | object): LibraryData;
    private static prepValueObject;
    Define(key: string, value: string): void;
    ClearDefinition(key: string): void;
    AddTemplate(...values: string[]): void;
    SetTemplate(index: number, value: string): void;
    RemoveTemplate(index: number): void;
    ClearTemplates(): void;
    GetValue(key: string): ValueItem[];
    AddValue(key: string, value: string | string[], weight?: number | number[]): void;
    SetValue(key: string, value: string | string[], weight?: number | number[]): void;
    DeleteValue(key: string): void;
    ClearValue(key: string): void;
    ClearValueWeights(key: string): void;
    AddValueItem(key: string, value: string, weight?: number): void;
    SetValueItem(key: string, index: number, value: string, weight?: number): void;
    SetValueItemWeight(key: string, index: number, weight: number): void;
    DeleteValueItem(key: string, index: number): void;
    ClearValueItem(key: string, index: number): void;
    static PrepValues(values: any, weights?: number | number[]): ValueItem[];
    static SplitValueWeights(arr: string[]): [string[], number[]];
    checkIndex(index: number, arrKey: string): void;
    private checkKey;
}
export default LibraryData;
