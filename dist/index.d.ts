type JsFreeFloatParseOptions = {
    /**
     * The minimum allowable value. Defaults to -Infinity.
     * Also used as the default value for empty input (unless keepEmpty is set).
     * */
    min?: number;
    /**
     * The maximum allowable value. Defaults to Infinity.
     * */
    max?: number;
    /**
     * If set to true, the function will use a dot as the decimal separator.
     * If false, it will use a comma. Defaults to comma.
     * */
    dot?: boolean;
    /**
     * The number of decimal places to include in the float output. Does not round the number, just cut
     * */
    decimals?: number;
    /**
     * If true, empty input (or input containing no digits at all, e.g. "abc")
     * returns ["", 0] instead of the min-based default. Defaults to false.
     * */
    keepEmpty?: boolean;
    /**
     * If false, min/max are not enforced on the parsed value (min is still used
     * as the default for empty input). Useful for per-keystroke parsing where
     * clamping should only happen on blur — parse with clamp: false while
     * typing, then re-parse with the default on blur. Defaults to true.
     * */
    clamp?: boolean;
    /**
     * Opt-in heuristic for group (thousands) separators: a comma directly
     * between a digit and a group of exactly 3 digits is treated as a group
     * separator and stripped, so "1,234.56" parses as 1234.56 and "1,234,567"
     * as 1234567. A comma followed by 1-2 or 4+ digits is still treated as a
     * decimal separator. Defaults to false.
     * */
    groupSeparators?: boolean;
};
export default function jsFreeFloatParse(input: string, options?: JsFreeFloatParseOptions): readonly [string, number];
export {};
//# sourceMappingURL=index.d.ts.map