import { Pipe, PipeTransform } from '@angular/core';

/**
 * A pipe that finds an object or objects from a given source array using key-value pairs.
 */
@Pipe({
    name: 'angorFindByKey',
    pure: false,
    standalone: true,
})
export class AngorFindByKeyPipe implements PipeTransform {
    /**
     * Transforms the input value by finding corresponding objects from the source array
     * based on the specified key-value pair.
     *
     * @param value A string or an array of strings to match in the source array.
     * @param key The key of the object property to search by.
     * @param source The array of objects to search within.
     * @returns A single object if `value` is a string, or an array of objects if `value` is an array.
     */
    transform(
        value: string | string[],
        key: string,
        source: any[]
    ): any | any[] {
        // If value is an array of strings, map each to its corresponding object in the source.
        if (Array.isArray(value)) {
            return value.map((item) =>
                source.find((sourceItem) => sourceItem[key] === item)
            );
        }

        // Otherwise, treat value as a single string and find the corresponding object.
        return source.find((sourceItem) => sourceItem[key] === value);
    }
}
