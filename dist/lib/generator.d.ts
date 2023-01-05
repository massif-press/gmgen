import GeneratorLibrary from './generatorLibrary';
import { logLevel } from './util';
interface templateItem {
    templates: string[];
}
type ValueItem = {
    value: string;
    weight: number;
};
declare class GeneratorOptions {
    Trim: boolean;
    CleanMultipleSpaces: boolean;
    ClearMissingKeys: boolean;
    CleanEscapes: boolean;
    ClearBracketSyntax: boolean;
    MaxIterations: number;
    PreventEarlyExit: boolean;
    Logging: logLevel;
}
declare class Generator {
    Library: GeneratorLibrary | undefined;
    ValueMap: Map<string, ValueItem[]>;
    private _timer;
    private _output;
    private _options;
    constructor(library?: GeneratorLibrary | null, options?: any);
    LoadLibrary(library: GeneratorLibrary): void;
    SetOptions(options: GeneratorOptions): void;
    SetOption(key: string, value: string | number | boolean): void;
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
    HasValueMap(key: string): boolean;
    GetValueMap(key: string): ValueItem[];
    SetValueMap(key: string, data: ValueItem[]): void;
    AddValueMap(key: string, data: ValueItem[]): void;
    DeleteValueMap(key: string): void;
    FindMissingValues(template?: string | string[] | templateItem, iterations?: number): string[];
    OverlappingDefinitions(): string[];
    Step(template?: string | string[] | templateItem): string;
    private _log;
    private _debugLog;
}
export { Generator, ValueItem };
