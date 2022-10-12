import _ from 'lodash';
import GeneratorLibrary from './generatorLibrary';
import LibraryData from './libraryData';
import { cLog, FloatBetween, WeightedSelection } from './util';

interface templateItem {
  templates: string[];
}

type ValueItem = {
  value: string;
  weight: number;
};

class GeneratorOptions {
  CleanMultipleSpaces: boolean = true;
  CapitalizeFirst: boolean = true;
  IgnoreMissingKeys: boolean = true;
  CleanEscapes: boolean = true;
  MaxIterations: number = 100;
  Logging: 'none' | 'errors only' | 'verbose' = 'errors only';
}

class Generator {
  public Library: GeneratorLibrary | undefined;
  public ValueMap: Map<string, ValueItem[]>;

  private _timer = 0;
  private _output = '';
  private _options = new GeneratorOptions();

  private _loggingLevel = 'errors only';

  constructor(library?: GeneratorLibrary | null, options?: GeneratorOptions) {
    this.ValueMap = new Map<string, ValueItem[]>();
    if (library) this.LoadLibrary(library);
    if (options) this.SetOptions(options);
  }

  public LoadLibrary(library: GeneratorLibrary) {
    this.startTimer();

    this.Library = library;

    library.Content.forEach((e: LibraryData) => {
      if (e.definitions) {
        for (const def in e.definitions) {
          this.Define(def, e.definitions[def]);
        }
      }
      if (e.values) {
        for (const prop in e.values) {
          this.AddValueMap(prop, e.values[prop]);
        }
      }
      if (e.templates) {
        e.templates.forEach((value) => {
          this.AddValueMap(e.key, [{ value, weight: 1 }]);
        });
      }
    });

    this.endTimer('Library loaded');
  }

  public SetOptions(options: GeneratorOptions) {
    this._options = options;
    this._loggingLevel = options.Logging;
  }

  public SetOption(key: keyof GeneratorOptions, value: any) {
    this._options[key as any] = value;
    if (key === 'Logging') this._loggingLevel = value;
  }

  public Generate(template?: string | string[] | templateItem): string {
    this.checkLibrary();
    this.startTimer();

    this._output = this.getBaseTemplate(template);
    let loops = this._options.MaxIterations;
    let selectionsRemaining = true;
    while (loops && selectionsRemaining) {
      selectionsRemaining = this.process();
      loops--;
    }

    if (!loops && this._loggingLevel !== 'none') {
      cLog(
        '🔁',
        'Generator has exceeded its iteration limit. This likely means an referenced key cannot be resolved. The FindMissingValues() function can help debug these issues.',
        'warning'
      );
    }

    this.endTimer(`Item generated (${100 - loops}  loops)`);

    this.cleanup();

    return this._output;
  }

  private cleanup() {
    this.clearCapitalSyntax();
    if (this._options.CleanMultipleSpaces) this.clearMultipleSpaces();
    if (this._options.IgnoreMissingKeys) this.clearMissingKeys();
    if (this._options.CleanEscapes) this.cleanEscapes();
  }

  private clearCapitalSyntax() {
    this._output = this._output.replace(/(?<!`)(\^+)/g, '');
  }

  private clearMultipleSpaces() {
    this._output = this._output.replace(/  +/g, ' ');
  }

  private clearMissingKeys() {
    const inlineRegex = /(?<!\`)%(.*?)%/g;
    const matches = [...this._output.matchAll(inlineRegex)];
    matches.forEach((match) => {
      if (!this.HasValueMap(match[1])) {
        this._output = this._output.replace(match[0], '');
      }
    });
  }

  private cleanEscapes() {
    this._output = this._output.replace(/`/g, '');
  }

  private process(): boolean {
    const contFlags = new Array(5).fill(false);
    // remove @pct misses
    contFlags[0] = this.resolvePcts();
    // remove @pct misses
    contFlags[1] = this.resolveInlineSelectionSets();
    // resolve inline selections
    contFlags[3] = this.resolveInline();
    // do other selections
    contFlags[4] = this.resolveSets();
    // assign keywords
    contFlags[2] = this.assignKeys();

    return contFlags.includes(true);
  }

  private processCapitals(idx: number, str: string): string {
    const isCarat = (idx: number): boolean => {
      return this._output[idx] === '^';
    };
    const cLevel = [idx - 3, idx - 2, idx - 1]
      .map((n) => isCarat(n))
      .filter((x) => (x = !!x)).length;
    switch (cLevel) {
      case 3:
        return str.toUpperCase();
      case 2:
        return str
          .split(' ')
          .map((w) => w[0].toUpperCase() + w.substring(1))
          .join(' ');
      case 1:
        return str[0].toUpperCase() + str.substring(1);
      default:
        return str;
    }
  }

  private resolveInlineSelectionSets() {
    let found = false;
    // collapse all inline sets of sets %like|this%
    // group 0 is full match, group 1 is content, not including syntactical elements
    const inlineRegex = /(?<!\`)%(.*?.)%/g;
    const matches = [...this._output.matchAll(inlineRegex)];
    matches.forEach((match) => {
      if (match[1].includes('|')) {
        found = true;
        this._output = this._output.replace(
          match[1],
          this._getInlineValue(match[1])
        );
      }
    });

    return found;
  }

  private assignKeys(): boolean {
    let found = false;
    // find all @key
    // group 0 is full match, group 1 is key, group 2 is content, including syntactical elements
    // backtick escapes
    const keywordRegex = /(?<!\`)@(.*?)([{%].*?[}%])/g;
    const matches = [...this._output.matchAll(keywordRegex)];
    matches.forEach((match) => {
      found = true;
      if (match[2].includes('{')) {
        // inline selection
        const val = this._getInlineValue(match[2]);
        this.Define(match[1], val);
        this._output = this._output.replace(match[0], '');
      } else {
        // array selection
        const vmKey = match[2].split('%').join('');
        if (this.HasValueMap(vmKey)) {
          const sel = this._getMapValue(vmKey);
          this.Define(match[1], sel);
          this._output = this._output.replace(match[0], '');
        }
      }
    });
    return found;
  }

  private resolveInline(): boolean {
    let found = false;
    // find all {inline|selections}
    // group 0 is full match, group 1 is content, not including syntactical elements
    // backtick escapes
    const inlineRegex = /(?<!\`){(.*?)}/g;
    const matches = [...this._output.matchAll(inlineRegex)];
    matches.forEach((match) => {
      if (!match.index) return;
      found = true;
      this._output = this._output.replace(
        match[0],
        this.processCapitals(match.index, this._getInlineValue(match[1]))
      );
    });

    return found;
  }

  private resolveSets(): boolean {
    let found = false;
    // find all %sets%
    // group 0 is full match, group 1 is content, not including syntactical elements
    // backtick escapes
    const inlineRegex = /(?<!\`)%(.*?)%/g;
    const matches = [...this._output.matchAll(inlineRegex)];
    matches.forEach((match) => {
      found = true;
      if (this.HasValueMap(match[1])) {
        this._output = this._output.replace(
          match[0],
          this._getMapValue(match[1])
        );
      }
    });

    return found;
  }

  private _getInlineValue(inlineStr: string): string {
    const valueItems = LibraryData.PrepValues(inlineStr);
    return (WeightedSelection(valueItems) as ValueItem).value;
  }

  private _getMapValue(mapKey: string): string {
    const selArr = this.GetValueMap(mapKey);
    return (WeightedSelection(selArr) as ValueItem).value;
  }

  private resolvePcts(): boolean {
    let found = false;
    // find all @pctN{x} and @pctN%x%
    // group 0 is full match, group 1 is pct, group 2 is content, including syntactical elements
    // backtick escapes
    const pctRegex = /(?<!\`)@pct(\.?\d*\.?\d*)([{%].*?[}%])/g;
    const matches = [...this._output.matchAll(pctRegex)];
    matches.forEach((match) => {
      found = true;
      if (this.rollPct(match[1])) {
        this._output = this._output.replace(match[0], match[2]);
      } else {
        this._output = this._output.replace(match[0], '');
      }
    });
    return found;
  }

  private rollPct(p: string): boolean {
    const n = Number(p);
    // roll under pct value for success
    return FloatBetween(0, 100) < n;
  }

  private startTimer() {
    this._timer = new Date().getTime();
  }

  private endTimer(msg: string) {
    let ms = (new Date().getTime() - this._timer).toString();
    if (ms === '0') ms = '<1';
    if (this._loggingLevel === 'verbose') cLog('⏱️', `${msg} in ${ms}ms`);
  }

  private getBaseTemplate(template: any): string {
    if (typeof template === 'string') return template;
    else if (Array.isArray(template)) return _.sample(template);
    else if (!template && this.Library) {
      template = _.sample(this.Library.Content) as templateItem;
      return _.sample(template.templates);
    } else if (template.templates)
      return this.getBaseTemplate(template.templates);
    else {
      if (this._loggingLevel !== 'none')
        cLog(
          `🚨','inappropriate or malformed template/template container sent to generator`,
          'error'
        );
      throw new Error(template);
    }
  }

  public Define(key: string, value: string) {
    this.checkLibrary();
    if (!this.HasValueMap(key)) this.ValueMap.set(key, [{ value, weight: 1 }]);
    else if (this._loggingLevel !== 'none')
      cLog(`🔒','A definition already exists for ${key} (${value})`, 'warning');
  }

  public HasValueMap(key: string): boolean {
    this.checkLibrary();
    return this.ValueMap.has(key);
  }

  public GetValueMap(key: string): ValueItem[] {
    this.checkLibrary();
    return this.ValueMap.get(key) || [];
  }

  public SetValueMap(key: string, data: ValueItem[]) {
    this.checkLibrary();
    this.ValueMap.set(key, data);
  }

  public AddValueMap(key: string, data: ValueItem[]) {
    this.checkLibrary();
    if (this.HasValueMap(key))
      this.ValueMap.set(key, [...this.GetValueMap(key), ...data]);
    else this.ValueMap.set(key, data);
  }

  public DeleteValueMap(key: string) {
    this.checkLibrary();
    this.ValueMap.delete(key);
  }

  private checkLibrary() {
    if (this.Library === undefined) {
      if (this._loggingLevel !== 'none')
        cLog(
          '🈳',
          'No library loaded! Load a GeneratorLibrary with the LoadLibrary function',
          'error'
        );
      throw new Error('Generator requires a GeneratorLibrary to operate');
    }
  }

  public FindMissingValues(
    template?: string | string[] | templateItem,
    iterations = 100
  ): string[] {
    const out: string[] = [];
    const cachedOptions = this._options;
    this.SetOptions({
      CleanMultipleSpaces: false,
      CapitalizeFirst: false,
      IgnoreMissingKeys: false,
      MaxIterations: iterations,
      CleanEscapes: false,
      Logging: 'none',
    });
    const res = this.Generate(template);

    if (!this.process()) return out;

    const inlineRegex = /(?<!\`)%(.*?)%/g;
    const matches = [...res.matchAll(inlineRegex)];
    matches.forEach((match) => {
      out.push(`Unresolvable Set Selection: ${match[0]}`);
    });

    this.SetOptions(cachedOptions);
    return out;
  }

  public OverlappingDefinitions(): string[] {
    this.checkLibrary();
    let defs: string[] = [];

    this.Library?.Content.map((data: LibraryData) => {
      defs = [...defs, ...Object.keys(data.definitions)];
    });
    const out: string[] = [];

    const seen = {};

    defs.forEach((def) => {
      console.log(def);
      if (seen[def]) out.push(`ALERT: overlapping definition at key "${def}"`);
      else seen[def] = true;

      if (
        defs
          .map((d) => d.toLowerCase())
          .some((x) => x !== def && x === def.toLowerCase())
      )
        out.push(
          `Warning: key "${def}" already exists, but in a different case. This will not cause an overlap but may be confusing.`
        );
    });

    return out;
  }

  public Step(template?: string | string[] | templateItem): string {
    const cachedOptions = this._options;
    this.SetOptions({
      CleanMultipleSpaces: false,
      CapitalizeFirst: false,
      IgnoreMissingKeys: false,
      MaxIterations: 1,
      CleanEscapes: true,
      Logging: 'none',
    });
    const res = this.Generate(template);
    this.SetOptions(cachedOptions);
    return res;
  }
}

export { Generator, ValueItem };
