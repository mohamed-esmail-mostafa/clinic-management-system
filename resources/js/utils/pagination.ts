export function isPaginated<T>(
    value: T[] | { data: T[] } | null | undefined
): value is { data: T[] } {
    return (
        value !== null &&
        value !== undefined &&
        !Array.isArray(value) &&
        'data' in value
    );
}