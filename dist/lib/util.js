"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLevel = exports.cLog = exports.WeightedSelection = exports.FloatBetween = void 0;
const FloatBetween = (min, max) => {
    return Math.random() * (max - min) + min;
};
exports.FloatBetween = FloatBetween;
const WeightedSelection = (collection) => {
    if (!collection || !collection.length) {
        return null;
    }
    const totals = [];
    let total = 0;
    for (let i = 0; i < collection.length; i++) {
        total += collection[i].weight || 1;
        totals.push(total);
    }
    const rnd = Math.floor(Math.random() * total);
    let selected = collection[0];
    for (let i = 0; i < totals.length; i++) {
        if (totals[i] > rnd) {
            selected = collection[i];
            break;
        }
    }
    return selected;
};
exports.WeightedSelection = WeightedSelection;
var logLevel;
(function (logLevel) {
    logLevel[logLevel["none"] = 0] = "none";
    logLevel[logLevel["error"] = 1] = "error";
    logLevel[logLevel["warning"] = 2] = "warning";
    logLevel[logLevel["verbose"] = 3] = "verbose";
    logLevel[logLevel["debug"] = 4] = "debug";
})(logLevel || (logLevel = {}));
exports.logLevel = logLevel;
const cLog = (level, msg, icon) => {
    const tagStyle = `background-color:${level === 1 ? '#991e2a' : level === 2 ? '#612a17' : '#253254'}; color:white; font-weight: bold; padding: 4px; border-radius: 2px`;
    if (!icon)
        icon = level === 1 ? '🚨' : level === 2 ? '⚠️' : '⚙️';
    console.log(`%c${icon} gmgen`, tagStyle, msg);
};
exports.cLog = cLog;
