import { Injectable } from '@angular/core';
import hljs from 'highlight.js';

@Injectable({ providedIn: 'root' })
export class AngorHighlightService {
    /**
     * Highlights the provided code using the specified language.
     */
    highlight(code: string, language: string): string {
        code = this._format(code); // Format the code
        return hljs.highlight(code, { language }).value; // Highlight and return the formatted code
    }

    /**
     * Removes empty lines around the code block and re-aligns indentation based on the first non-whitespace character.
     */
    private _format(code: string): string {
        let indentation = 0;
        const lines = code.split('\n'); // Split the code into lines

        // Remove empty lines at the start and end
        while (lines.length && lines[0].trim() === '') {
            lines.shift();
        }
        while (lines.length && lines[lines.length - 1].trim() === '') {
            lines.pop();
        }

        // Determine the smallest indentation
        lines
            .filter((line) => line.length)
            .forEach((line, index) => {
                if (index === 0) {
                    indentation = line.search(/\S|$/);
                } else {
                    indentation = Math.min(line.search(/\S|$/), indentation);
                }
            });

        // Remove extra indentation and return formatted code
        return lines.map((line) => line.substring(indentation)).join('\n');
    }
}
