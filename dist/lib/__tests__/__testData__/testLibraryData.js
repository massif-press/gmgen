"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testData = exports.keylessData = void 0;
const keylessData = {
    definitions: {
        test_a: 'test a',
    },
    values: {
        test_b: 'test b',
    },
    templates: ['test c'],
};
exports.keylessData = keylessData;
const testData = {
    key: 'testitem',
    definitions: {
        def_a: 'a',
        def_b: 'b',
    },
    values: {
        string_val: 'solo string val',
        inline_sel: '{inline1|inline2|inline3}',
        weighted_inline_sel: '{inline4:1|inline5:6|inline6:10|inline7}',
        arr_sel: ['arr1', 'arr2'],
        weighted_arr_sel: ['arr3:8', 'arr4:11', 'arr5'],
        nested_arr_sel: [['nest1', 2], ['nest2', 3], ['nest3']],
        prop_sel: [
            { value: 'prop1', weight: 2 },
            { value: 'prop2', weight: 3 },
            { value: 'prop3', weight: 1 },
        ],
        endless_loop: 'loop %endless_loop%',
    },
    templates: [
        'template1: {inline|test} {weighted:2|inline:3|test} @key{inline|key|assign}',
        'template2',
    ],
};
exports.testData = testData;
