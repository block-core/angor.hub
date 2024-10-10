import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'stripHtml',
    standalone: true,
})
export class StripHtmlPipe implements PipeTransform {
    transform(value: string, limit: number = 200): string {
        if (!value) {
            return '...';
        }

        // Strip HTML tags and replace them with a space
        let strippedText = value.replace(/<\/?[^>]+(>|$)/g, ' ');

        // Replace &nbsp; with a space
        strippedText = strippedText.replace(/&nbsp;/g, ' ');

        // Remove extra spaces
        const normalizedText = strippedText.replace(/\s\s+/g, ' ').trim();

        // Limit the text to the specified number of characters
        let result = normalizedText;
        if (normalizedText.length > limit) {
            result = normalizedText.substring(0, limit);
        }

        // Always add "..." at the end
        return result.trim() + '...';
    }
}
