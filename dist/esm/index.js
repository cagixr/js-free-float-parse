import Decimal from "decimal.js";
function replaceDotByComma(input, dot = false) {
    return dot ? input : input.replace(".", ",");
}
function applyDecimals(input, decimals) {
    if (typeof decimals === "number") {
        if (decimals < 0)
            throw new Error("decimals must be a positive integer");
        const [basePart, floatPart] = input.split(".");
        if (floatPart) {
            if (decimals === 0)
                return basePart;
            return [basePart, floatPart.slice(0, decimals)].join(".");
        }
    }
    return input;
}
export default function jsFreeFloatParse(input, options) {
    try {
        const { min, max, dot = false, decimals, keepEmpty = false, clamp = true, groupSeparators = false } = options || {};
        const isMin = typeof min === "number";
        const isMax = typeof max === "number";
        let outputNumber = new Decimal(isMin ? min : 0);
        let outputString = outputNumber.toString();
        // eslint-disable-next-line no-inner-declarations
        function result() {
            outputString = replaceDotByComma(outputString, dot);
            return [outputString, outputNumber.toNumber()];
        }
        // eslint-disable-next-line no-inner-declarations
        function emptyResult() {
            if (keepEmpty) {
                return ["", 0];
            }
            return result();
        }
        if (!input) {
            return emptyResult();
        }
        // Some short exceptions
        switch (true) {
            case input === ",":
            case input === ".": {
                outputString = dot ? "0." : "0,";
                return result();
            }
            case input === "0,":
            case input === "0.": {
                outputString = dot ? "0." : "0,";
                return result();
            }
            case input === "-": {
                outputString = "-";
                return result();
            }
            case input === "-0": {
                outputString = "-0";
                return result();
            }
            case input === "-0,":
            case input === "-0.": {
                outputString = dot ? "-0." : "-0,";
                return result();
            }
        }
        // Expand exponent notation ("5e-8", "1.5E+3", "-1.5e-3", "1e5") into a
        // plain decimal string, then continue with the regular flow below so that
        // sign, min/max and decimals are handled uniformly
        if (/\de\s*[+-]?\d/i.test(input)) {
            // Split the number into coefficient and exponent parts
            const [coefficientStr, exponentStr] = input.split(/e/i);
            // Parse the exponent part into an integer
            const exponent = parseInt(exponentStr.replace(/[^\d+-]/g, ""), 10);
            // Guard against absurd exponents that would expand into huge strings —
            // such values are not representable as JS numbers anyway, so treat them
            // like input without digits
            if (Math.abs(exponent) > 10000) {
                return emptyResult();
            }
            // Handle the sign before expanding — it must not end up inside the digits
            const isNegativeCoefficient = /^\s*-/.test(coefficientStr);
            const coefficient = coefficientStr.replace(/[^\d.,]/g, "").replaceAll(",", ".");
            // Split the coefficient part into integer and decimal parts
            const [integerPart, decimalPart = ""] = coefficient.split(".");
            const digits = integerPart + decimalPart;
            // Position of the decimal point within the digits after applying the exponent
            const pointPosition = integerPart.length + exponent;
            let expanded;
            if (pointPosition <= 0) {
                // The point moves past the leftmost digit — pad with leading zeros
                expanded = "0." + "0".repeat(-pointPosition) + digits;
            }
            else if (pointPosition >= digits.length) {
                // The point moves past the rightmost digit — pad with trailing zeros
                expanded = digits + "0".repeat(pointPosition - digits.length);
            }
            else {
                expanded = digits.slice(0, pointPosition) + "." + digits.slice(pointPosition);
            }
            input = (isNegativeCoefficient ? "-" : "") + expanded;
        }
        const isNegative = /^\s*-/.test(input);
        // Remove non-digit signs excluding dot and comma
        input = input.replace(/[^\d.,]/g, "");
        // Strip group (thousands) commas: a comma between a digit and exactly 3 digits
        if (groupSeparators) {
            input = input.replace(/(\d),(?=\d{3}(?:\D|$))/g, "$1");
        }
        // Replace all commas with dots
        input = input.replaceAll(",", ".");
        // Remove leading dots
        input = input.replace(/^\.*/, "");
        // Remove multiple dots
        const dotParts = input.split(".");
        // Means we have more than one dot
        if (dotParts.length > 2) {
            const [firstPart, ...restParts] = dotParts;
            const firstPartNumber = parseFloat(firstPart);
            const isFirstPartNumber = !isNaN(firstPartNumber);
            if (isFirstPartNumber) {
                const noDotsRestParts = restParts.join("");
                input = [firstPart, noDotsRestParts].join(".");
            }
        }
        // Input contained no digits at all (e.g. "abc")
        if (!input) {
            if (isNegative) {
                outputString = "-";
                return result();
            }
            return emptyResult();
        }
        // Remove leading zeros
        if (input.startsWith("0")) {
            input = input.replace(/^0*(?=\d)/, "");
        }
        // Return negative sign back after removing
        if (isNegative) {
            input = "-" + input;
        }
        /*
         * Final check and decimals
         * */
        outputNumber = new Decimal(input);
        outputString = input;
        // Apply min/max
        if (clamp) {
            if (isMin && outputNumber.lt(min)) {
                outputNumber = new Decimal(min);
                outputString = outputNumber.toFixed();
            }
            if (isMax && outputNumber.gt(max)) {
                outputNumber = new Decimal(max);
                outputString = outputNumber.toFixed();
            }
        }
        // Set decimals
        outputString = applyDecimals(outputString, decimals);
        outputNumber = new Decimal(outputString);
        return result();
    }
    catch (e) {
        throw new Error(`jsFreeFloatParse: ${e}`);
    }
}
//# sourceMappingURL=index.js.map