import { AngorAlertComponent } from '@angor/components/alert';
import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { IndexerService } from 'app/services/indexer.service';

@Component({
    selector: 'settings-indexer',
    templateUrl: './indexer.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        AngorAlertComponent,
        MatRadioModule,
        NgClass,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        CurrencyPipe,
        CommonModule,
    ],
})
export class SettingsIndexerComponent implements OnInit {
    mainnetIndexers: Array<{ url: string; primary: boolean }> = [];
    testnetIndexers: Array<{ url: string; primary: boolean }> = [];
    newMainnetIndexerUrl: string = '';
    newTestnetIndexerUrl: string = '';

    constructor(private indexerService: IndexerService) {}

    ngOnInit(): void {
        this.loadIndexers();
    }

    loadIndexers(): void {
        this.mainnetIndexers = this.indexerService
            .getIndexers('mainnet')
            .map((url) => ({
                url,
                primary:
                    url === this.indexerService.getPrimaryIndexer('mainnet'),
            }));
        this.testnetIndexers = this.indexerService
            .getIndexers('testnet')
            .map((url) => ({
                url,
                primary:
                    url === this.indexerService.getPrimaryIndexer('testnet'),
            }));

        console.log('Mainnet Indexers:', this.mainnetIndexers);
        console.log('Testnet Indexers:', this.testnetIndexers);
    }

    addIndexer(network: 'mainnet' | 'testnet'): void {
        if (network === 'mainnet' && this.newMainnetIndexerUrl) {
            this.indexerService.addIndexer(
                this.newMainnetIndexerUrl,
                'mainnet'
            );
            this.loadIndexers();
            this.newMainnetIndexerUrl = '';
        } else if (network === 'testnet' && this.newTestnetIndexerUrl) {
            this.indexerService.addIndexer(
                this.newTestnetIndexerUrl,
                'testnet'
            );
            this.loadIndexers();
            this.newTestnetIndexerUrl = '';
        }
    }

    removeIndexer(
        network: 'mainnet' | 'testnet',
        indexer: { url: string; primary: boolean }
    ): void {
        this.indexerService.removeIndexer(indexer.url, network);
        this.loadIndexers();
    }

    setPrimaryIndexer(
        network: 'mainnet' | 'testnet',
        indexer: { url: string; primary: boolean }
    ): void {
        this.indexerService.setPrimaryIndexer(indexer.url, network);
        this.loadIndexers();
    }

    trackByFn(index: number, item: any): any {
        return item.url;
    }
}
