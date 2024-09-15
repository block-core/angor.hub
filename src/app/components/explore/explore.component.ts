import { AngorCardComponent } from '@angor/components/card';
import { AngorFindByKeyPipe } from '@angor/pipes/find-by-key';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgClass, PercentPipe, I18nPluralPipe } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

@Component({
    selector     : 'explore',
    standalone   : true,
    templateUrl  : './explore.component.html',
    encapsulation: ViewEncapsulation.None,
     imports: [MatButtonModule, RouterLink, MatIconModule, AngorCardComponent ,
        CdkScrollable,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatInputModule,
        MatSlideToggleModule,
        NgClass,
        MatTooltipModule,
        MatProgressBarModule,
        AngorFindByKeyPipe,
        PercentPipe,
        I18nPluralPipe,
         ],
})
export class ExampleComponent
{
filterByCategory($event: any) {
throw new Error('Method not implemented.');
}
categories: any;
trackByFn(_t22: number,_t21: any) {
throw new Error('Method not implemented.');
}
filterByQuery(arg0: any) {
throw new Error('Method not implemented.');
}
toggleCompleted($event: any) {
throw new Error('Method not implemented.');
}
    /**
     * Constructor
     */
    constructor()
    {
    }
}
