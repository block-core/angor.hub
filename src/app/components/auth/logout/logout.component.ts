import { I18nPluralPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SignerService } from 'app/services/signer.service';
import { Subject, finalize, takeUntil, takeWhile, tap, timer } from 'rxjs';

@Component({
    selector: 'auth-logout',
    templateUrl: './logout.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [RouterLink, I18nPluralPipe],
})
export class LogoutComponent implements OnInit, OnDestroy {
    countdown: number = 5;
    countdownMapping: any = {
        '=1': '# second',
        other: '# seconds',
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _router: Router,
        private _signerService: SignerService
    ) {}

    ngOnInit(): void {
        timer(1000, 1000)
            .pipe(
                takeWhile(() => this.countdown > 0),
                takeUntil(this._unsubscribeAll),
                tap(() => this.countdown--),
                finalize(() => {
                    this.logout();
                    this._router.navigate(['login']);
                })
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    logout(): void {
        this._signerService.clearPassword();
        this._signerService.logout();
        console.log('User logged out and keys removed from localStorage.');
    }
}
