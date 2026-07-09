# js-free-float-parse

`js-free-float-parse` is a JavaScript library built on top of `decimal.js`
that designed to parse and convert user/html input strings into numeric values,
handling various edge cases such as leading zeros typing and formatting options.

For test-cases see `tests/index.spec.ts`

### Installation

```bash
npm install js-free-float-parse
```

### Usage

```typescript
import jsFreeFloatParse from 'js-free-float-parse';

const options = {
  min: 0,
  max: 100,
  dot: true,
  decimals: 2
};

const [string, number] = jsFreeFloatParse('12,34', options);

console.log(string); // "12.34"
console.log(number); // 12.34
```

### Options

```typescript
type Options = {
  /**
   * The minimum allowable value. Defaults to -Infinity.
   * */
  min?: number
  /**
   * The maximum allowable value. Defaults to Infinity.
   * */
  max?: number
  /**
   * If set to true, the function will use a dot as the decimal separator.
   * If false, it will use a comma. Defaults to comma.
   * */
  dot?: boolean
  /**
   * The number of decimal places to include in the float output. Does not round the number, just cut
   * */
  decimals?: number
  /**
   * If true, empty input (or input containing no digits at all, e.g. "abc")
   * returns ["", 0] instead of the min-based default. Defaults to false.
   * */
  keepEmpty?: boolean
  /**
   * If false, min/max are not enforced on the parsed value (min is still used
   * as the default for empty input). Useful for per-keystroke parsing where
   * clamping should only happen on blur — parse with clamp: false while
   * typing, then re-parse with the default on blur. Defaults to true.
   * */
  clamp?: boolean
  /**
   * Opt-in heuristic for group (thousands) separators: a comma directly
   * between a digit and a group of exactly 3 digits is treated as a group
   * separator and stripped, so "1,234.56" parses as 1234.56 and "1,234,567"
   * as 1234567. A comma followed by 1-2 or 4+ digits is still treated as a
   * decimal separator. Defaults to false.
   * */
  groupSeparators?: boolean
}
```

### Recipes

```typescript
// Keystroke-friendly form input: no clamping while typing, clamp on blur
const onChange = (raw: string) => jsFreeFloatParse(raw, { min: 10, max: 100, clamp: false });
const onBlur = (raw: string) => jsFreeFloatParse(raw, { min: 10, max: 100 });

// Keep empty inputs empty instead of forcing "0" / min
jsFreeFloatParse("", { keepEmpty: true }); // ["", 0]

// en-US pastes with thousands separators
jsFreeFloatParse("1,234.56", { dot: true, groupSeparators: true }); // ["1234.56", 1234.56]
```

### Testing

Library uses `vitest` for testing

```bash
npm run test
```

### Edge Cases

The function handles various edge cases, such as:

- Empty input
- Single decimal separators (dot or comma)
- Negative values
- Leading zeros
- Multiple decimal separators
- Exponent notation like *(5.5e-10)*, including negative coefficients *(-1.5e-3)*,
  bare/uppercase exponents *(1e5, 1E+5)* and multi-digit coefficients *(15e-3)*
- Input without any digits ("abc") returns the default instead of throwing
- Exponents beyond ±10000 (not representable as JS numbers) are treated as input without digits

The function never throws for any string input (the only exception is a negative
`decimals` option, which is a programmer error).
