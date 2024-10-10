import { angorAnimations } from '@angor/animations';
import { NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';

@Component({
    selector: 'angor-masonry',
    templateUrl: './masonry.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: angorAnimations,
    exportAs: 'angorMasonry',
    standalone: true,
    imports: [NgTemplateOutlet],
})
export class AngorMasonryComponent implements OnChanges, AfterViewInit {
    @Input() columnsTemplate: TemplateRef<any>;
    @Input() columns: number;
    @Input() items: any[] = [];
    distributedColumns: any[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if ('columns' in changes || 'items' in changes) {
            this._distributeItems();
        }
    }

    ngAfterViewInit(): void {
        this._distributeItems();
    }

    private _distributeItems(): void {
        if (this.items.length === 0) {
            this.distributedColumns = [];
            return;
        }

        this.distributedColumns = Array.from({ length: this.columns }, () => ({
            items: [],
        }));

        this.items.forEach((item, index) => {
            this.distributedColumns[index % this.columns].items.push(item);
        });
    }
}
