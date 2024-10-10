import { AngorHighlightService } from '@angor/components/highlight/highlight.service';
import { NgClass } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EmbeddedViewRef,
    inject,
    Input,
    OnChanges,
    SecurityContext,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'textarea[angor-highlight]',
    templateUrl: './highlight.component.html',
    styleUrls: ['./highlight.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'angorHighlight',
    standalone: true,
    imports: [NgClass],
})
export class AngorHighlightComponent implements OnChanges, AfterViewInit {
    private _domSanitizer = inject(DomSanitizer);
    private _elementRef = inject(ElementRef);
    private _angorHighlightService = inject(AngorHighlightService);
    private _viewContainerRef = inject(ViewContainerRef);

    @Input() code: string;
    @Input() lang: string;
    @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

    highlightedCode: string;
    private _viewRef: EmbeddedViewRef<any>;

    ngOnChanges(changes: SimpleChanges): void {
        if ('code' in changes || 'lang' in changes) {
            if (!this._viewContainerRef.length) return;
            this._highlightAndInsert();
        }
    }

    ngAfterViewInit(): void {
        if (!this.lang) return;
        if (!this.code) {
            this.code = this._elementRef.nativeElement.value;
        }
        this._highlightAndInsert();
    }

    private _highlightAndInsert(): void {
        if (!this.templateRef || !this.code || !this.lang) return;

        if (this._viewRef) {
            this._viewRef.destroy();
            this._viewRef = null;
        }

        this.highlightedCode = this._domSanitizer.sanitize(
            SecurityContext.HTML,
            this._angorHighlightService.highlight(this.code, this.lang)
        );

        if (this.highlightedCode === null) return;

        this._viewRef = this._viewContainerRef.createEmbeddedView(
            this.templateRef,
            { highlightedCode: this.highlightedCode, lang: this.lang }
        );

        this._viewRef.detectChanges();
    }
}
