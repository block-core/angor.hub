import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'size',
    standalone: true,
})
export class SizePipe implements PipeTransform {
    transform(value: any, args?: any): any {
        if (value == null) {
            return '';
        }

        if (value === 0) {
            return '0 Bytes';
        }

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.floor(Math.log(value) / Math.log(k));

        return parseFloat((value / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
