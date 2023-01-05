declare const FloatBetween: (min: number, max: number) => number;
declare const WeightedSelection: (collection: any[]) => any;
declare enum logLevel {
    none = 0,
    error = 1,
    warning = 2,
    verbose = 3,
    debug = 4
}
declare const cLog: (level: logLevel, msg: string, icon?: string) => void;
export { FloatBetween, WeightedSelection, cLog, logLevel };
