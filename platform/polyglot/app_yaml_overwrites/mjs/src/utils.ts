
/**
 * Per requirement: "Arrays are replaced, not concatenated"
 */
export function deepMerge(target: any, source: any): any {
    if (typeof target !== 'object' || target === null) {
        return source;
    }
    if (typeof source !== 'object' || source === null) {
        return source;
    }

    // Arrays: Replace (as per requirement 2.1)
    if (Array.isArray(source)) {
        return [...source];
    }

    // Objects: Recursive merge
    const output = { ...target };

    Object.keys(source).forEach(key => {
        if (typeof source[key] === 'object' && source[key] !== null) {
            if (!(key in target)) {
                Object.assign(output, { [key]: source[key] });
            } else {
                output[key] = deepMerge(target[key], source[key]);
            }
        } else {
            Object.assign(output, { [key]: source[key] });
        }
    });

    return output;
}
