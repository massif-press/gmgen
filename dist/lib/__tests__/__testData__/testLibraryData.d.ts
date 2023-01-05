declare const keylessData: {
    definitions: {
        test_a: string;
    };
    values: {
        test_b: string;
    };
    templates: string[];
};
declare const testData: {
    key: string;
    definitions: {
        def_a: string;
        def_b: string;
    };
    values: {
        string_val: string;
        inline_sel: string;
        weighted_inline_sel: string;
        arr_sel: string[];
        weighted_arr_sel: string[];
        nested_arr_sel: (string | number)[][];
        prop_sel: {
            value: string;
            weight: number;
        }[];
        endless_loop: string;
    };
    templates: string[];
};
export { keylessData, testData };
