import { logLevel } from './util';
interface templateItem {
    templates: string[];
}
type ValueItem = {
    value: string;
    weight: number;
};
type GeneratorOptions = {
    Trim: boolean;
    CleanMultipleSpaces: boolean;
    ClearMissingKeys: boolean;
    CleanEscapes: boolean;
    ClearBracketSyntax: boolean;
    MaxIterations: number;
    PreventEarlyExit: boolean;
    Logging: logLevel;
};
declare class Generator {
    ValueMap: Map<string, ValueItem[]>;
    DefinitionMap: Map<string, string>;
    private _timer;
    private _output;
    private _options;
    constructor(options?: any);
    AddData(data: any): void;
    SetOptions(options: GeneratorOptions): void;
    SetOption<K extends keyof GeneratorOptions>(key: K, value: GeneratorOptions[K]): void;
    Generate(template?: string | string[] | templateItem): string;
    private cleanup;
    private processCapitals;
    private clearCapitalSyntax;
    private clearBracketSyntax;
    private clearMultipleSpaces;
    private trim;
    private clearMissingKeys;
    private cleanEscapes;
    private innerProcess;
    private outerProcess;
    private resolveRepeats;
    private resolveDefinitions;
    private conditionalSelection;
    private compositionalSelection;
    private resolveInlineSelectionSets;
    private assignKeys;
    private resolveInline;
    private resolveSets;
    private _getInlineValue;
    private _getMapValue;
    private resolvePcts;
    private rollPct;
    private startTimer;
    private endTimer;
    private getBaseTemplate;
    get Options(): GeneratorOptions;
    Define(key: string, value: string): void;
    IsDefined(key: string): boolean;
    HasValueMap(key: string): boolean;
    GetValueMap(key: string): ValueItem[];
    SetValueMap(key: string, data: ValueItem[]): void;
    AddValueMap(key: string, data: ValueItem[]): void;
    DeleteValueMap(key: string): void;
    FindMissingValues(template?: string | string[] | templateItem, iterations?: number): string[];
    OverlappingDefinitions(data: any): string[];
    Step(template?: string | string[] | templateItem): string;
    private _log;
    private _debugLog;
}
export { Generator, ValueItem };
