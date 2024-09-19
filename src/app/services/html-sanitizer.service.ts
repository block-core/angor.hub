import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HtmlSanitizerService {

  stripHtmlTags(input: string): string {
    if (!input) {
      return '';
    }

    // Remove script and style tags and their content
    input = input.replace(/<script.*?>.*?<\/script>/gi, '');
    input = input.replace(/<style.*?>.*?<\/style>/gi, '');

    // Remove style and class attributes from all tags
    input = input.replace(/<([a-zA-Z][^\s>]*)(\s+[^>]*)?>/gi, (match, tag, attributes) => {
      attributes = attributes.replace(/\s+(style|class)\s*=\s*"[^"]*"/gi, '');
      return `<${tag}${attributes}>`;
    });

    // Only allow certain HTML tags (br, p, a, etc.)
    const allowedTagsPattern = /<(?!\/?(br|p|a|ul|ol|li|strong|em|b|i|u|hr|blockquote|img|div|span|table|thead|tbody|tr|td|th)\b)[^>]+>/gi;
    input = input.replace(allowedTagsPattern, '');

    // Replace block-level tags with <br /> for formatting
    const blockTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'section', 'article', 'footer', 'header', 'main'];
    blockTags.forEach(tag => {
      const regex = new RegExp(`<\\/?${tag}[^>]*>`, 'gi');
      input = input.replace(regex, '<br />');
    });

    // Remove any remaining HTML tags that are not allowed
    input = input.replace(/<((?!br\s*\/?)[^>]+)>/gi, '');

    // Collapse multiple newlines into one
    input = input.replace(/(\r?\n){2,}/g, '\n');
    input = input.replace(/(<br\s*\/?>\s*){2,}/g, '<br />');

    // Trim unnecessary <br /> at the start or end
    input = input.replace(/^\s*<br\s*\/?>\s*|\s*<br\s*\/?>\s*$/g, '');
    input = input.replace(/\s*(<br\s*\/?>)\s*/g, '$1');

    return input;
  }
}
