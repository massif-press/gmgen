"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generator = void 0;
const lodash_1 = __importDefault(require("lodash"));
const generatorLibrary_1 = __importDefault(require("./generatorLibrary"));
const libraryData_1 = __importDefault(require("./libraryData"));
const util_1 = require("./util");
const defaultGeneratorOptions = () => {
    return {
        Trim: true,
        CleanMultipleSpaces: true,
        ClearMissingKeys: true,
        CleanEscapes: true,
        ClearBracketSyntax: true,
        MaxIterations: 100,
        PreventEarlyExit: false,
        Logging: util_1.logLevel.error,
    };
};
class Generator {
    constructor(options) {
        this._timer = 0;
        this._output = '';
        this._options = defaultGeneratorOptions();
        this.ValueMap = new Map();
        this.DefinitionMap = new Map();
        this._baseTemplates = [];
        if (options)
            this.SetOptions(options);
    }
    AddData(data) {
        this._debugLog('Loading Data');
        this.startTimer();
        const library = new generatorLibrary_1.default(data);
        library.Content.forEach((e, i) => {
            this._debugLog(`Processing library content (${i} of ${library.Content.length})`);
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
                if (!this._baseTemplates.length) {
                    this._baseTemplates = [...e.templates];
                }
                e.templates.forEach((value) => {
                    this.AddValueMap(e.key, [{ value, weight: 1 }]);
                });
            }
        });
        this.endTimer('Library loaded');
    }
    SetOptions(options) {
        for (const key in this._options) {
            if (key in options)
                this.SetOption(key, options[key]);
        }
    }
    SetOption(key, value) {
        this._options[key] = value;
    }
    Generate(template) {
        this._debugLog('Beginning generation');
        this.startTimer();
        this._output = this.getBaseTemplate(template);
        let loops = this._options.MaxIterations;
        let completed = 0;
        while (loops > 0) {
            this._debugLog(`Beginning generation loop (${completed + 1}/${this._options.MaxIterations})`);
            let cachedOutput = this._output;
            this.innerProcess();
            this.outerProcess();
            if (loops > 2 &&
                this._output === cachedOutput &&
                !this._options.PreventEarlyExit) {
                this._log(util_1.logLevel.verbose, `Generator output matches cached output; terminating early`);
                loops = 2;
            }
            loops--;
            completed++;
        }
        // to ensure that Step() works correctly
        if (this._options.MaxIterations > 1)
            this.outerProcess();
        if (completed === this._options.MaxIterations) {
            this._log(util_1.logLevel.warning, 'Generator has exceeded its iteration limit. This likely means an referenced key cannot be resolved. The FindMissingValues() function can help debug these issues.');
        }
        this.endTimer(`Item generated (${completed} loops)`);
        this.cleanup();
        return this._output;
    }
    cleanup() {
        this._debugLog('Starting postprocessing...');
        this.processCapitals();
        this.clearCapitalSyntax();
        if (this._options.ClearBracketSyntax)
            this.clearBracketSyntax();
        if (this._options.CleanMultipleSpaces)
            this.clearMultipleSpaces();
        if (this._options.ClearMissingKeys)
            this.clearMissingKeys();
        if (this._options.CleanEscapes)
            this.cleanEscapes();
        if (this._options.Trim)
            this.trim();
        this._debugLog('Postprocessing complete');
    }
    processCapitals() {
        // group 1 is opening carats, group 2 is content, group 3 is closing carat
        const capitalizeRegex = /(?<!\`)(\^+)(.*?)(\^)/g;
        const matches = [...this._output.matchAll(capitalizeRegex)];
        if (matches.length) {
            this._debugLog(`Found ${matches.length} capitalization sets, processing...`);
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
    clearCapitalSyntax() {
        this._debugLog('Cleaning remaining capital syntax...');
        this._output = this._output.replace(/(?<!`)(\^+)/g, '');
    }
    clearBracketSyntax() {
        this._debugLog('Cleaning remaining bracket syntax...');
        this._output = this._output.replace(/(?<!`)[{}]/g, '');
    }
    clearMultipleSpaces() {
        this._debugLog('Cleaning multiple whitespace...');
        this._output = this._output.replace(/  +/g, ' ');
    }
    trim() {
        this._debugLog('Trimming starting/ending whitespace...');
        this._output = this._output.trim();
    }
    clearMissingKeys() {
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
    cleanEscapes() {
        this._debugLog('Cleaning escapes');
        this._output = this._output.replace(/`/g, '');
    }
    innerProcess() {
        let innerLoops = 5;
        while (innerLoops > 0) {
            // expand repeats
            this._output = this.resolveRepeats(this._output);
            // set explicit definitions
            this.resolveDefinitions();
            // remove @pct misses
            this._output = this.resolvePcts(this._output);
            // assign keywords
            this._output = this.assignKeys(this._output);
            // remove inline selection sets misses
            this._output = this.resolveInlineSelectionSets(this._output);
            // resolve inline selections
            this._output = this.resolveInline(this._output);
            // do other selections
            this._output = this.resolveSets(this._output);
            innerLoops--;
        }
    }
    outerProcess() {
        this._output = this.conditionalSelection(this._output);
        this._output = this.compositionalSelection(this._output);
    }
    resolveRepeats(input) {
        let result = input;
        // find all @compose
        // group 0 is full match, group 1 is repeat, group 2 is content
        // backtick escapes
        const pctRegex = /(?<!\`)@repeat:(\d*)\((.*?)\)/g;
        const matches = [...input.matchAll(pctRegex)];
        matches.forEach((match) => {
            this._debugLog(`Processing repeat: ${match[0]}`);
            result = result.replace(match[0], match[2].repeat(Number(match[1])));
        });
        return result;
    }
    resolveDefinitions() {
        //go through definitions and attempt to resolve into valuemap
        const pctRegex = /(?<!`)[%|{|@]/g;
        for (const [k, v] of this.DefinitionMap.entries()) {
            //if they have no unescaped reserved characters, add to valuemap
            if (!pctRegex.test(v)) {
                this.AddValueMap(k, [{ value: v, weight: 1 }]);
                this.DefinitionMap.delete(k);
            }
            else {
                //if they have reserved characters, attempt to resolve
                let resV = v;
                resV = this.resolvePcts(resV);
                resV = this.assignKeys(resV);
                resV = this.resolveInlineSelectionSets(resV);
                resV = this.resolveInline(resV);
                resV = this.resolveSets(resV);
                resV = this.conditionalSelection(resV);
                resV = this.compositionalSelection(resV);
                this.DefinitionMap.set(k, resV);
            }
        }
    }
    conditionalSelection(input) {
        let result = input;
        // find all @if and @!if
        // group 0 is full match, group 1 is if/!if, group 2 is key OR key=val, group 3 is content including syntactical elements
        // backtick escapes
        const pctRegex = /(?<!\`)@(!if|if):(\S*)([{%].*?[}%])/g;
        const matches = [...input.matchAll(pctRegex)];
        if (matches.length) {
            this._debugLog(`Found ${matches.length} conditional selections, processing...`);
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
                        result = result.replace(match[0], '');
                    }
                    else {
                        this._debugLog(`Value found (${match[2]}); conditional TRUE`);
                        result = result.replace(match[0], match[3]);
                    }
                }
                else {
                    if (val === mapValue[0].value) {
                        if (match[1].includes('!')) {
                            this._debugLog(`Evaluation TRUE (${match[2]} = ${mapValue[0].value}); conditional FALSE`);
                            result = result.replace(match[0], '');
                        }
                        else {
                            this._debugLog(`Evaluation TRUE (${match[2]} = ${mapValue[0].value}); conditional TRUE`);
                            result = result.replace(match[0], match[3]);
                        }
                    }
                    else {
                        if (match[1].includes('!')) {
                            this._debugLog(`Evaluation FALSE (${match[2]} != ${mapValue[0].value}); conditional FALSE`);
                            result = result.replace(match[0], match[3]);
                        }
                        else {
                            this._debugLog(`Evaluation FALSE (${match[2]} != ${mapValue[0].value}); conditional TRUE`);
                            result = result.replace(match[0], '');
                        }
                    }
                }
            }
            else if (!mapValue || !mapValue.length) {
                if (match[1].includes('!')) {
                    this._debugLog(`Value not found (${match[2]}) OR evaluation not resolvable; conditional FALSE`);
                    result = result.replace(match[0], match[3]);
                }
                else {
                    this._debugLog(`Value not found (${match[2]}) OR evaluation not resolvable; conditional TRUE`);
                    result = result.replace(match[0], '');
                }
            }
        });
        return result;
    }
    compositionalSelection(input) {
        let result = input;
        // find all @compose
        // group 0 is full match, group 1 is inner value not including syntactical elements
        // backtick escapes
        const composeRegex = /(?<!\`)@compose\((.*?)\)/g;
        const matches = [...input.matchAll(composeRegex)];
        matches.forEach((match) => {
            this._debugLog(`Processing compositional: ${match[0]}`);
            let res = match[1];
            res = res.replaceAll(/[%{}|]/g, '');
            if (this.HasValueMap(res)) {
                const sel = this._getMapValue(res);
                this._debugLog(`Composed value exists (${sel}), resolving selection`);
                result = result.replace(match[0], sel);
            }
        });
        return result;
    }
    resolveInlineSelectionSets(input) {
        let result = input;
        // collapse all inline sets of sets %like|this%
        // group 0 is full match, group 1 is content, not including syntactical elements
        const inlineRegex = /(?<!\`)%(.*?.)%/g;
        const matches = [...input.matchAll(inlineRegex)];
        matches.forEach((match) => {
            if (match[1].includes('|')) {
                this._debugLog(`Processing inline selection: ${match[0]}`);
                result = result.replace(match[1], this._getInlineValue(match[1]));
            }
        });
        return result;
    }
    assignKeys(input) {
        let result = input;
        // find all @key
        // group 0 is full match, group 1 is key, group 2 is content, including syntactical elements
        // backtick escapes
        const keywordRegex = /(?<!\`)@(.*?)([{%].*?[}%])/g;
        const matches = [...input.matchAll(keywordRegex)];
        matches.forEach((match) => {
            this._debugLog(`Processing key assignment: ${match[0]}`);
            if (match[1].match(/pct[0-9]+/) ||
                match[1].includes('if:') ||
                match[1].includes('compose')) {
                this._debugLog(`Syntax includes reserved characters, abandoning`);
                return;
            }
            if (match[2].includes('{')) {
                // inline selection
                const val = this._getInlineValue(match[2]);
                this.Define(match[1], val);
                this._debugLog(`Defined @${match[1]} as ${val}`);
                result = result.replace(match[0], '');
            }
            else {
                // array selection
                const vmKey = match[2].split('%').join('');
                if (this.HasValueMap(vmKey)) {
                    const sel = this._getMapValue(vmKey);
                    this.Define(match[1], sel);
                    this._debugLog(`Defined @${match[1]} as ${sel}`);
                    result = result.replace(match[0], '');
                }
            }
        });
        return result;
    }
    resolveInline(input) {
        let result = input;
        // find all {inline|selections}
        // group 0 is full match, group 1 is content, not including syntactical elements
        // backtick escapes
        const inlineRegex = /(?<!\`){(.*?)}/g;
        const matches = [...input.matchAll(inlineRegex)];
        matches.forEach((match) => {
            if (!match[1].includes('|'))
                return;
            this._debugLog(`Processing inline selection: ${match[0]}`);
            const sel = this._getInlineValue(match[1]);
            this._debugLog(`Map value found, resolving selection (${sel})`);
            result = result.replace(match[0], sel);
        });
        return result;
    }
    resolveSets(input) {
        let result = input;
        // find all %sets%
        // group 0 is full match, group 1 is content, not including syntactical elements
        // backtick escapes
        const inlineRegex = /(?<!\`)%(.*?)%/g;
        const matches = [...input.matchAll(inlineRegex)];
        matches.forEach((match) => {
            this._debugLog(`Processing selection: ${match[0]}`);
            if (this.HasValueMap(match[1])) {
                const sel = this._getMapValue(match[1]);
                this._debugLog(`Map value found, resolving selection (${sel})`);
                result = result.replace(match[0], sel);
            }
        });
        return result;
    }
    _getInlineValue(inlineStr) {
        const valueItems = libraryData_1.default.PrepValues(inlineStr);
        return (0, util_1.WeightedSelection)(valueItems).value;
    }
    _getMapValue(mapKey) {
        const selArr = this.GetValueMap(mapKey);
        return (0, util_1.WeightedSelection)(selArr).value;
    }
    resolvePcts(input) {
        let result = input;
        // find all @pctN{x} and @pctN%x%
        // group 0 is full match, group 1 is pct, group 2 is content, including syntactical elements
        // backtick escapes
        const pctRegex = /(?<!\`)@pct(\.?\d*\.?\d*)([{%].*?[}%])/g;
        const matches = [...input.matchAll(pctRegex)];
        matches.forEach((match) => {
            this._debugLog(`Processing @pct conditional: ${match[0]}`);
            if (this.rollPct(match[1])) {
                this._debugLog(`Roll success (>${match[1]}), keeping selection`);
                result = result.replace(match[0], match[2]);
            }
            else {
                this._debugLog(`Roll failure (<${match[1]}), removing selection`);
                result = result.replace(match[0], '');
            }
        });
        return result;
    }
    rollPct(p) {
        const n = Number(p);
        // roll under pct value for success
        return (0, util_1.FloatBetween)(0, 100) < n;
    }
    startTimer() {
        this._timer = new Date().getTime();
    }
    endTimer(msg) {
        let ms = (new Date().getTime() - this._timer).toString();
        if (ms === '0')
            ms = '<1';
        this._log(util_1.logLevel.verbose, `${msg} in ${ms}ms`);
    }
    getBaseTemplate(template) {
        this._debugLog(`Getting initial template...`);
        if (typeof template === 'string')
            return template;
        else if (Array.isArray(template))
            return lodash_1.default.sample(template);
        else if (!template && this._baseTemplates.length) {
            return lodash_1.default.sample(this._baseTemplates);
        }
        else if (template.templates)
            return this.getBaseTemplate(template.templates);
        else {
            this._log(util_1.logLevel.error, 'inappropriate or malformed template/template container sent to generator');
            throw new Error(template);
        }
    }
    get Options() {
        return this._options;
    }
    Define(key, value) {
        if (!this.IsDefined(key))
            this.DefinitionMap.set(key, value);
        this._log(util_1.logLevel.warning, `A definition exists for ${key} (${value})`);
    }
    IsDefined(key) {
        return this.DefinitionMap.has(key);
    }
    HasValueMap(key) {
        return this.ValueMap.has(key);
    }
    GetValueMap(key) {
        return this.ValueMap.get(key) || [];
    }
    SetValueMap(key, data) {
        if (data[0] && !data[0].value)
            data = libraryData_1.default.PrepValues(data);
        this.ValueMap.set(key, data);
    }
    AddValueMap(key, data) {
        if (this.HasValueMap(key))
            this.ValueMap.set(key, [...this.GetValueMap(key), ...data]);
        else
            this.SetValueMap(key, data);
    }
    DeleteValueMap(key) {
        this.ValueMap.delete(key);
    }
    FindMissingValues(template, iterations = 100) {
        const out = [];
        const cachedOptions = this._options;
        this.SetOptions({
            Trim: false,
            CleanMultipleSpaces: false,
            ClearBracketSyntax: false,
            ClearMissingKeys: false,
            MaxIterations: iterations,
            CleanEscapes: false,
            PreventEarlyExit: true,
            Logging: util_1.logLevel.none,
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
    OverlappingDefinitions(data) {
        let defs = [];
        const library = new generatorLibrary_1.default(data);
        library.Content.map((data) => {
            defs = [...defs, ...Object.keys(data.definitions)];
        });
        const out = [];
        const seen = {};
        defs.forEach((def) => {
            if (seen[def])
                out.push(`ALERT: overlapping definition at key "${def}"`);
            else
                seen[def] = true;
            if (defs
                .map((d) => d.toLowerCase())
                .some((x) => x !== def && x === def.toLowerCase()))
                out.push(`Warning: key "${def}" already exists, but in a different case. This will not cause an overlap but may be confusing.`);
        });
        return out;
    }
    Step(template) {
        const cachedOptions = this._options;
        this.SetOptions({
            CleanMultipleSpaces: false,
            ClearMissingKeys: false,
            MaxIterations: 1,
            CleanEscapes: false,
            Trim: false,
            ClearBracketSyntax: false,
            PreventEarlyExit: true,
            Logging: util_1.logLevel.none,
        });
        const res = this.Generate(template);
        this.SetOptions(cachedOptions);
        return res;
    }
    _log(level, msg) {
        if (level <= this._options.Logging)
            (0, util_1.cLog)(level, msg);
    }
    _debugLog(msg) {
        if (this._options.Logging === util_1.logLevel.debug)
            (0, util_1.cLog)(util_1.logLevel.debug, msg, '👾');
    }
}
exports.Generator = Generator;
