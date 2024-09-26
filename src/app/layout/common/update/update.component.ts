import { CommonModule, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
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
        CommonModule
    ],
})
export class UpdateComponent   {
    public updateService: NewVersionCheckerService;

    constructor(updateService: NewVersionCheckerService) {
        this.updateService = updateService;
    }

    applyUpdate(): void {
        this.updateService.applyUpdate();
    }
}
