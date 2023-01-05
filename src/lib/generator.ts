import _ from 'lodash';
import GeneratorLibrary from './generatorLibrary';
import LibraryData from './libraryData';
import { cLog, logLevel, FloatBetween, WeightedSelection } from './util';

interface templateItem {
  templates: string[];
}

type ValueItem = {
  value: string;
  weight: number;
};

class GeneratorOptions {
  Trim: boolean = true;
  CleanMultipleSpaces: boolean = true;
  ClearMissingKeys: boolean = true;
  CleanEscapes: boolean = true;
  ClearBracketSyntax: boolean = true;
  MaxIterations: number = 100;
  PreventEarlyExit: boolean = false;
  Logging: logLevel = logLevel.error;
}

class Generator {
  public Library: GeneratorLibrary | undefined;
  public ValueMap: Map<string, ValueItem[]>;

  private _timer = 0;
  private _output = '';
  private _options = new GeneratorOptions();

  constructor(library?: GeneratorLibrary | null, options?: any) {
    this.ValueMap = new Map<string, ValueItem[]>();
    if (library) this.LoadLibrary(library);
    if (options) this.SetOptions(options);
  }

  public LoadLibrary(library: GeneratorLibrary) {
    this._debugLog('Loading Library');
    this.startTimer();

    this.Library = library;

    library.Content.forEach((e: LibraryData, i: Number) => {
      this._debugLog(
        `Processing library content (${i} of ${library.Content.length})`
      );

      if (e.definitions) {
        this._debugLog(`Processing library definitions`);

        for (const def in e.definitions) {
          this.Define(def, e.definitions[def]);
        }
      }
      if (e.values) {
        this._debugLog(`Processing library values`);

        for (const prop in e.values) {
          this.AddValueMap(prop, e.values[prop]);
        }
      }
      if (e.templates) {
        this._debugLog(`Processing library templates`);

        e.templates.forEach((value) => {
          this.AddValueMap(e.key, [{ value, weight: 1 }]);
        });
      }
    });

    this.endTimer('Library loaded');
  }

  public SetOptions(options: any) {
    for (const key in this._options) {
      if (key in options) this._options[key] = options[key];
    }
  }

  public SetOption(key: keyof GeneratorOptions, value: any) {
    this._options[key as any] = value;
  }

  public Generate(template?: string | string[] | templateItem): string {
    this._debugLog('Beginning generation');
    this.startTimer();

    this._output = this.getBaseTemplate(template);
    let loops = this._options.MaxIterations;
    let completed = 0;
    while (loops > 0) {
      this._debugLog(
        `Beginning generation loop (${completed + 1}/${
          this._options.MaxIterations
        })`
      );

      let cachedOutput = this._output;

      this.innerProcess();
      this.outerProcess();

      if (
        loops > 2 &&
        this._output === cachedOutput &&
        !this._options.PreventEarlyExit
      ) {
        this._log(
          logLevel.verbose,
          `Generator output matches cached output; terminating early`
        );
        loops = 2;
      }

      loops--;
      completed++;
    }
    // to ensure that Step() works correctly
    if (this._options.MaxIterations > 1) this.outerProcess();

    if (completed === this._options.MaxIterations) {
      this._log(
        logLevel.warning,
        'Generator has exceeded its iteration limit. This likely means an referenced key cannot be resolved. The FindMissingValues() function can help debug these issues.'
      );
    }

    this.endTimer(`Item generated (${completed} loops)`);

    this.cleanup();

    return this._output;
  }

  private cleanup() {
    this._debugLog('Starting postprocessing...');
    this.processCapitals();
    this.clearCapitalSyntax();
    if (this._options.ClearBracketSyntax) this.clearBracketSyntax();
    if (this._options.CleanMultipleSpaces) this.clearMultipleSpaces();
    if (this._options.ClearMissingKeys) this.clearMissingKeys();
    if (this._options.CleanEscapes) this.cleanEscapes();
    if (this._options.Trim) this.trim();
    this._debugLog('Postprocessing complete');
  }

  private processCapitals() {
    // group 1 is opening carats, group 2 is content, group 3 is closing carat
    const capitalizeRegex = /(?<!\`)(\^+)(.*?)(\^)/g;
    const matches = [...this._output.matchAll(capitalizeRegex)];

    if (matches.length) {
      this._debugLog(
        `Found ${matches.length} capitalization sets, processing...`
      );
    }

    matches.forEach((match) => {
      let val;
      switch (match[1].length) {
        case 3:
          val = match[2].toUpperCase();
          break;
        case 2:
          val = match[2]
            .split(' ')
            .map((w) => (w[0] ? w[0].toUpperCase() + w.substring(1) : ''))
            .join(' ');
          break;
        default:
          val = match[2][0]
            ? match[2][0].toUpperCase() + match[2].substring(1)
            : '';
          break;
      }
      this._output = this._output.replace(match[0], val);
    });
  }

  private clearCapitalSyntax() {
    this._debugLog('Cleaning remaining capital syntax...');

    this._output = this._output.replace(/(?<!`)(\^+)/g, '');
  }

  private clearBracketSyntax() {
    this._debugLog('Cleaning remaining bracket syntax...');
    this._output = this._output.replace(/(?<!`)[{}]/g, '');
  }

  private clearMultipleSpaces() {
    this._debugLog('Cleaning multiple whitespace...');
    this._output = this._output.replace(/  +/g, ' ');
  }

  private trim() {
    this._debugLog('Trimming starting/ending whitespace...');

    this._output = this._output.trim();
  }

  private clearMissingKeys() {
    this._debugLog('Cleaning unresolvable keys...');
    const missingKeyRegex = /(?<!\`)%(.*?)%/g;
    const matches = [...this._output.matchAll(missingKeyRegex)];
    matches.forEach((match) => {
      if (!this.HasValueMap(match[1])) {
        this._debugLog(`Missing key detected (${match[1]}), removing`);
        this._output = this._output.replace(match[0], '');
      }
    });
  }

  private cleanEscapes() {
    this._debugLog('Cleaning escapes');
    this._output = this._output.replace(/`/g, '');
  }

  private innerProcess(): boolean {
    const contFlags = new Array(5).fill(true);

    let innerLoops = 5;

    while (innerLoops > 0) {
      // remove @pct misses
      contFlags[0] = this.resolvePcts();
      // assign keywords
      contFlags[1] = this.assignKeys();
      // remove inline selection sets misses
      contFlags[2] = this.resolveInlineSelectionSets();
      // resolve inline selections
      contFlags[3] = this.resolveInline();
      // do other selections
      contFlags[4] = this.resolveSets();

      innerLoops--;
    }

    return contFlags.includes(true);
  }

  private outerProcess() {
    this.conditionalSelection();
    this.compositionalSelection();
  }

  private conditionalSelection() {
    // find all @if and @!if
    // group 0 is full match, group 1 is if/!if, group 2 is key OR key=val, group 3 is content including syntactical elements
    // backtick escapes
    const pctRegex = /(?<!\`)@(!if|if):(\S*)([{%].*?[}%])/g;
    const matches = [...this._output.matchAll(pctRegex)];
    if (matches.length) {
      this._debugLog(
        `Found ${matches.length} conditional selections, processing...`
      );
    }
    matches.forEach((match) => {
      this._debugLog(`Evaluating conditional selection: ${match[0]}`);
      const kArr = match[2].split('=');
      const key = kArr[0];
      const val = kArr.length === 2 ? kArr[1] : '';
      const mapValue = this.GetValueMap(key);
      if (mapValue.length) {
        if (!val) {
          // if no evaluation, replace on key found
          if (match[1].includes('!')) {
            this._debugLog(`Value found (${match[2]}); conditional FALSE`);
            this._output = this._output.replace(match[0], '');
          } else {
            this._debugLog(`Value found (${match[2]}); conditional TRUE`);
            this._output = this._output.replace(match[0], match[3]);
          }
        } else {
          if (val === mapValue[0].value) {
            if (match[1].includes('!')) {
              this._debugLog(
                `Evaluation TRUE (${match[2]} = ${mapValue[0].value}); conditional FALSE`
              );
              this._output = this._output.replace(match[0], '');
            } else {
              this._debugLog(
                `Evaluation TRUE (${match[2]} = ${mapValue[0].value}); conditional TRUE`
              );
              this._output = this._output.replace(match[0], match[3]);
            }
          } else {
            if (match[1].includes('!')) {
              this._debugLog(
                `Evaluation FALSE (${match[2]} != ${mapValue[0].value}); conditional FALSE`
              );
              this._output = this._output.replace(match[0], match[3]);
            } else {
              this._debugLog(
                `Evaluation FALSE (${match[2]} != ${mapValue[0].value}); conditional TRUE`
              );
              this._output = this._output.replace(match[0], '');
            }
          }
        }
      } else if (!mapValue || !mapValue.length) {
        if (match[1].includes('!')) {
          this._debugLog(
            `Value not found (${match[2]}) OR evaluation not resolvable; conditional FALSE`
          );
          this._output = this._output.replace(match[0], match[3]);
        } else {
          this._debugLog(
            `Value not found (${match[2]}) OR evaluation not resolvable; conditional TRUE`
          );
          this._output = this._output.replace(match[0], '');
        }
      }
    });
  }

  private compositionalSelection() {
    // find all @compose
    // group 0 is full match, group 1 is inner value not including syntactical elements
    // backtick escapes
    const pctRegex = /(?<!\`)@compose\((.*?)\)/g;
    const matches = [...this._output.matchAll(pctRegex)];
    matches.forEach((match) => {
      this._debugLog(`Processing compositional: ${match[0]}`);
      let res = match[1];
      res = res.replaceAll(/[%{}|]/g, '');
      if (this.HasValueMap(res)) {
        const sel = this._getMapValue(res);
        this._debugLog(`Composed value exists (${sel}), resolving selection`);
        this._output = this._output.replace(match[0], sel);
      }
    });
  }

  private resolveInlineSelectionSets() {
    let found = false;
    // collapse all inline sets of sets %like|this%
    // group 0 is full match, group 1 is content, not including syntactical elements
    const inlineRegex = /(?<!\`)%(.*?.)%/g;
    const matches = [...this._output.matchAll(inlineRegex)];
    matches.forEach((match) => {
      if (match[1].includes('|')) {
        this._debugLog(`Processing inline selection: ${match[0]}`);
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
      this._debugLog(`Processing key assignment: ${match[0]}`);
      if (
        match[1].match(/pct[0-9]+/) ||
        match[1].includes('if:') ||
        match[1].includes('compose')
      ) {
        this._debugLog(`Syntax includes reserved characters, abandoning`);
        return;
      }
      found = true;
      if (match[2].includes('{')) {
        // inline selection
        const val = this._getInlineValue(match[2]);
        this.Define(match[1], val);
        this._debugLog(`Defined @${match[1]} as ${val}`);
        this._output = this._output.replace(match[0], '');
      } else {
        // array selection
        const vmKey = match[2].split('%').join('');
        if (this.HasValueMap(vmKey)) {
          const sel = this._getMapValue(vmKey);
          this.Define(match[1], sel);
          this._debugLog(`Defined @${match[1]} as ${sel}`);
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
      if (!match[1].includes('|')) return false;
      this._debugLog(`Processing inline selection: ${match[0]}`);
      found = true;
      const sel = this._getInlineValue(match[1]);
      this._debugLog(`Map value found, resolving selection (${sel})`);
      this._output = this._output.replace(match[0], sel);
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
      this._debugLog(`Processing selection: ${match[0]}`);
      found = true;

      if (this.HasValueMap(match[1])) {
        const sel = this._getMapValue(match[1]);
        this._debugLog(`Map value found, resolving selection (${sel})`);
        this._output = this._output.replace(match[0], sel);
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
      this._debugLog(`Processing @pct conditional: ${match[0]}`);
      found = true;
      if (this.rollPct(match[1])) {
        this._debugLog(`Roll success (>${match[1]}), keeping selection`);

        this._output = this._output.replace(match[0], match[2]);
      } else {
        this._debugLog(`Roll failure (<${match[1]}), removing selection`);
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
    this._log(logLevel.verbose, `${msg} in ${ms}ms`);
  }

  private getBaseTemplate(template: any): string {
    this._debugLog(`Getting initial template...`);
    if (typeof template === 'string') return template;
    else if (Array.isArray(template)) return _.sample(template);
    else if (!template && this.Library) {
      template = _.sample(this.Library.Content) as templateItem;
      return _.sample(template.templates);
    } else if (template.templates)
      return this.getBaseTemplate(template.templates);
    else {
      this._log(
        logLevel.error,
        'inappropriate or malformed template/template container sent to generator'
      );
      throw new Error(template);
    }
  }

  public get Options(): GeneratorOptions {
    return this._options;
  }

  public Define(key: string, value: string) {
    if (!this.HasValueMap(key)) this.ValueMap.set(key, [{ value, weight: 1 }]);
    this._log(logLevel.warning, `A definition exists for ${key} (${value})`);
  }

  public HasValueMap(key: string): boolean {
    return this.ValueMap.has(key);
  }

  public GetValueMap(key: string): ValueItem[] {
    return this.ValueMap.get(key) || [];
  }

  public SetValueMap(key: string, data: ValueItem[]) {
    if (data[0] && !data[0].value) data = LibraryData.PrepValues(data);
    this.ValueMap.set(key, data);
  }

  public AddValueMap(key: string, data: ValueItem[]) {
    if (this.HasValueMap(key))
      this.ValueMap.set(key, [...this.GetValueMap(key), ...data]);
    else this.SetValueMap(key, data);
  }

  public DeleteValueMap(key: string) {
    this.ValueMap.delete(key);
  }

  public FindMissingValues(
    template?: string | string[] | templateItem,
    iterations = 100
  ): string[] {
    const out: string[] = [];
    const cachedOptions = this._options;
    this.SetOptions({
      Trim: false,
      CleanMultipleSpaces: false,
      ClearBracketSyntax: false,
      ClearMissingKeys: false,
      MaxIterations: iterations,
      CleanEscapes: false,
      Logging: 'none',
    });
    const res = this.Generate(template);
    const inlineRegex = /(?<!\`)%(.*?)%/g;
    const matches = [...res.matchAll(inlineRegex)];
    matches.forEach((match) => {
      out.push(`Unresolvable Set Selection: ${match[0]}`);
    });

    this.SetOptions(cachedOptions);
    return out;
  }

  public OverlappingDefinitions(): string[] {
    let defs: string[] = [];

    this.Library?.Content.map((data: LibraryData) => {
      defs = [...defs, ...Object.keys(data.definitions)];
    });
    const out: string[] = [];

    const seen = {};

    defs.forEach((def) => {
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
      ClearMissingKeys: false,
      MaxIterations: 1,
      CleanEscapes: false,
      Logging: 'none',
    });
    const res = this.Generate(template);
    this.SetOptions(cachedOptions);
    return res;
  }

  private _log(level: logLevel, msg: string) {
    if (level <= this._options.Logging) cLog(level, msg);
  }

  private _debugLog(msg: string) {
    if (this._options.Logging === logLevel.debug)
      cLog(logLevel.debug, msg, '👾');
  }
}

export { Generator, ValueItem };
