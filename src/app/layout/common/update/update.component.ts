import {
    CommonModule,
    DatePipe,
    NgClass,
    NgTemplateOutlet,
} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { NewVersionCheckerService } from 'app/services/update.service';

@Component({
    selector: 'update',
    templateUrl: './update.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'update',
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        NgClass,
        NgTemplateOutlet,
        RouterLink,
        DatePipe,
        CommonModule,
    ],
})
export class UpdateComponent {
    @Input() tooltip: string;

    constructor(
        public updateService: NewVersionCheckerService,
        private cdr: ChangeDetectorRef // Injecting ChangeDetectorRef
    ) {
        // Listen to the update available event and trigger change detection
        this.updateService.isNewVersionAvailable$.subscribe((isAvailable) => {
            if (isAvailable) {
                this.cdr.detectChanges(); // Trigger change detection
            }
        });
    }

    applyUpdate(): void {
        this.updateService.applyUpdate();
    }
}
