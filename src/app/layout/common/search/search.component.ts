import { angorAnimations } from '@angor/animations/public-api';
import { Overlay } from '@angular/cdk/overlay';
import { CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
    inject,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormControl,
} from '@angular/forms';
import {
    MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
    MatAutocomplete,
    MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { IndexedDBService } from 'app/services/indexed-db.service';
import { Subject, debounceTime, filter, map, takeUntil } from 'rxjs';

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    encapsulation: ViewEncapsulation.None,
    exportAs: 'angorSearch',
    animations: angorAnimations,
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        FormsModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatOptionModule,
        RouterLink,
        NgTemplateOutlet,
        MatFormFieldModule,
        MatInputModule,
        NgClass,
        CommonModule,
    ],
    providers: [
        {
            provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
            useFactory: () => {
                const overlay = inject(Overlay);
                return () => overlay.scrollStrategies.block();
            },
        },
    ],
})
export class SearchComponent implements OnChanges, OnInit, OnDestroy {
    @Input() appearance: 'basic' | 'bar' = 'basic';
    @Input() debounce: number = 300;
    @Input() minLength: number = 2;
    @Output() search: EventEmitter<any> = new EventEmitter<any>();

    opened: boolean = false;
    resultSets: any[];
    searchControl: UntypedFormControl = new UntypedFormControl();
    private _matAutocomplete: MatAutocomplete;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _indexedDBService: IndexedDBService,
        private _sanitizer: DomSanitizer
    ) {}

    @ViewChild('barSearchInput')
    set barSearchInput(value: ElementRef) {
        if (value) {
            setTimeout(() => {
                value.nativeElement.focus();
            });
        }
    }

    @ViewChild('matAutocomplete')
    set matAutocomplete(value: MatAutocomplete) {
        this._matAutocomplete = value;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('appearance' in changes) {
            this.close();
        }
    }

    ngOnInit(): void {
        this.searchControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                takeUntil(this._unsubscribeAll),
                map((value) => {
                    if (!value || value.length < this.minLength) {
                        this.resultSets = null;
                    }

                    return value;
                }),
                filter((value) => value && value.length >= this.minLength)
            )
            .subscribe(async (value) => {
                const results =
                    await this._indexedDBService.searchUsersByMetadata(value);

                this.resultSets = results.map((result) => ({
                    label: 'Project',
                    results: [
                        {
                            name:
                                result.user.name ||
                                result.user.displayName ||
                                result.pubkey,
                            pubkey: result.pubkey,
                            username: result.user.username || '',
                            website: result.user.website || '',
                            about: result.user.about
                                ? result.user.about.replace(
                                      /<\/?[^>]+(>|$)/g,
                                      ''
                                  )
                                : '',
                            avatar: result.user.picture || null,
                            banner: result.user.banner || null,
                            link: `/profile/${result.pubkey}`,
                        },
                    ],
                }));

                this.search.next(this.resultSets);
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.code === 'Escape') {
            if (this.appearance === 'bar' && !this._matAutocomplete.isOpen) {
                this.close();
            }
        }
    }

    open(): void {
        if (this.opened) {
            return;
        }

        this.opened = true;
    }

    close(): void {
        if (!this.opened) {
            return;
        }

        this.searchControl.setValue('');
        this.opened = false;
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    handleImageError(event: Event): void {
        const target = event.target as HTMLImageElement;
        target.onerror = null;
        target.src = 'images/avatars/avatar-placeholder.png';
    }
}
