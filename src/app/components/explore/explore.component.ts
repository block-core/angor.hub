import { AngorCardComponent } from '@angor/components/card';
import { AngorFindByKeyPipe } from '@angor/pipes/find-by-key';
import { CdkScrollable } from '@angular/cdk/scrolling';
import {
    CommonModule,
    I18nPluralPipe,
    NgClass,
    PercentPipe,
} from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { Project } from 'app/interface/project.interface';
import { IndexedDBService } from 'app/services/indexed-db.service';
import { MetadataService } from 'app/services/metadata.service';
import { Subject, takeUntil } from 'rxjs';
import { ProjectsService } from '../../services/projects.service';
import { StateService } from '../../services/state.service';
import { ChatService } from '../chat/chat.service';
import { Contact } from '../chat/chat.types';

@Component({
    selector: 'explore',
    standalone: true,
    templateUrl: './explore.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatButtonModule,
        RouterLink,
        MatIconModule,
        AngorCardComponent,
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
        CommonModule,
    ],
})
export class ExploreComponent implements OnInit, OnDestroy {
    projects: Project[] = [];
    errorMessage: string = '';
    loading: boolean = false;
    private metadataLoadLimit = 5;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    filteredProjects: Project[] = [];
    showCloseSearchButton: boolean = false;

    constructor(
        private projectService: ProjectsService,
        private router: Router,
        private stateService: StateService,
        private metadataService: MetadataService,
        private indexedDBService: IndexedDBService,
        private changeDetectorRef: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        private _chatService: ChatService
    ) {}

    async ngOnInit(): Promise<void> {
        this.loadInitialProjects();
        this.subscribeToMetadataUpdates();
    }

    private async loadInitialProjects(): Promise<void> {
        try {
            this.loading = true;
            this.projects = this.stateService.getProjects();

            if (this.projects.length === 0) {
                await this.loadProjectsFromService();
            } else {
                this.filteredProjects = [...this.projects];
                const pubkeysToFetch = this.getProjectsWithoutMetadata();
                if (pubkeysToFetch.length > 0) {
                    await this.loadMetadataForProjects(pubkeysToFetch);
                }
            }
        } catch (error) {
            this.handleError('Error loading initial projects');
        } finally {
            this.loading = false;
            this.changeDetectorRef.detectChanges();
        }
    }

    private async loadProjectsFromService(): Promise<void> {
        try {
            const projects = await this.projectService.fetchProjects();
            if (projects.length === 0) {
                this.errorMessage = 'No projects found';
                return;
            }

            this.projects = projects;
            this.filteredProjects = [...this.projects];
            this.stateService.setProjects(this.projects);

            const pubkeys = projects.map((p) => p.nostrPubKey);
            await this.loadMetadataForProjects(pubkeys);
        } catch (error) {
            this.handleError('Error fetching projects from service');
        }
    }
    private subscribeToMetadataUpdates(): void {
        this.indexedDBService
            .getMetadataStream()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((updatedMetadata: any) => {
                if (updatedMetadata) {
                    const projectToUpdate = this.projects.find(
                        (p) => p.nostrPubKey === updatedMetadata.pubkey
                    );
                    if (projectToUpdate) {
                        this.updateProjectMetadata(
                            projectToUpdate,
                            updatedMetadata.metadata
                        );
                    }
                }
            });
    }

    private getProjectsWithoutMetadata(): string[] {
        return this.projects
            .filter((project) => !project.displayName || !project.about)
            .map((project) => project.nostrPubKey);
    }

    private async loadMetadataForProjects(pubkeys: string[]): Promise<void> {
        const metadataPromises = pubkeys.map(async (pubkey) => {
            // Check cache first
            const cachedMetadata =
                await this.indexedDBService.getUserMetadata(pubkey);
            if (cachedMetadata) {
                return { pubkey, metadata: cachedMetadata };
            }
            return null; // This will allow us to fetch the missing ones later
        });

        const metadataResults = await Promise.all(metadataPromises);

        // Filter out nulls (which represent pubkeys without cached metadata)
        const missingPubkeys = metadataResults
            .filter((result) => result === null)
            .map((_, index) => pubkeys[index]);

        // Update projects that have cached metadata
        metadataResults.forEach((result) => {
            if (result && result.metadata) {
                const project = this.projects.find(
                    (p) => p.nostrPubKey === result.pubkey
                );
                if (project) {
                    this.updateProjectMetadata(project, result.metadata);
                }
            }
        });

        // Fetch metadata for pubkeys that are not cached
        if (missingPubkeys.length > 0) {
            await this.metadataService
                .fetchMetadataForMultipleKeys(missingPubkeys)
                .then((metadataList: any[]) => {
                    metadataList.forEach((metadata) => {
                        const project = this.projects.find(
                            (p) => p.nostrPubKey === metadata.pubkey
                        );
                        if (project) {
                            this.updateProjectMetadata(project, metadata);
                        }
                    });
                    this.changeDetectorRef.detectChanges();
                })
                .catch((error) => {
                    console.error(
                        'Error fetching metadata for projects:',
                        error
                    );
                });
        }
    }

    async loadProjects(): Promise<void> {
        if (this.loading || this.errorMessage === 'No more projects found')
            return;

        this.loading = true;

        this.projectService
            .fetchProjects()
            .then(async (projects: Project[]) => {
                if (projects.length === 0 && this.projects.length === 0) {
                    this.errorMessage = 'No projects found';
                } else if (projects.length === 0) {
                    this.errorMessage = 'No more projects found';
                } else {
                    this.projects = [...this.projects, ...projects];
                    this.filteredProjects = [...this.projects];

                    const pubkeys = projects.map(
                        (project) => project.nostrPubKey
                    );

                    await this.loadMetadataForProjects(pubkeys);

                    this.stateService.setProjects(this.projects);

                    this.projects.forEach((project) =>
                        this.subscribeToProjectMetadata(project)
                    );
                }
                this.loading = false;
                this.changeDetectorRef.detectChanges();
            })
            .catch((error: any) => {
                console.error('Error fetching projects:', error);
                this.errorMessage =
                    'Error fetching projects. Please try again later.';
                this.loading = false;
                this.changeDetectorRef.detectChanges();
            });
    }

    async loadMetadataForProject(project: Project): Promise<void> {
        try {
            const metadata = await this.metadataService.fetchMetadataWithCache(
                project.nostrPubKey
            );
            if (metadata) {
                this.updateProjectMetadata(project, metadata);
            } else {
                console.warn(
                    `No metadata found for project ${project.nostrPubKey}`
                );
            }
        } catch (error) {
            console.error(
                `Error fetching metadata for project ${project.nostrPubKey}:`,
                error
            );
        }
    }

    updateProjectMetadata(project: Project, metadata: any): void {
        const updatedProject: Project = {
            ...project,
            displayName: metadata.name || '',
            about: metadata.about
                ? metadata.about.replace(/<\/?[^>]+(>|$)/g, '')
                : '',
            picture: metadata.picture || '',
            banner: metadata.banner || '',
        };

        const index = this.projects.findIndex(
            (p) => p.projectIdentifier === project.projectIdentifier
        );
        if (index !== -1) {
            this.projects[index] = updatedProject;
            this.projects = [...this.projects];
        }

        this.filteredProjects = [...this.projects];
        this.changeDetectorRef.detectChanges();
    }

    subscribeToProjectMetadata(project: Project): void {
        this.metadataService
            .getMetadataStream()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((updatedMetadata: any) => {
                if (
                    updatedMetadata &&
                    updatedMetadata.pubkey === project.nostrPubKey
                ) {
                    this.updateProjectMetadata(
                        project,
                        updatedMetadata.metadata
                    );
                }
            });
    }

    goToProjectDetails(project: Project): void {
        this.loading = true;

        this.projectService
            .fetchAndSaveProjectStats(project.projectIdentifier)
            .then((stats) => {
                if (stats) {
                    this.navigateToProfile(project.nostrPubKey);
                } else {
                    console.error('Failed to fetch project stats from API');
                    this.handleError('Error fetching project stats');
                }
            })
            .catch((error) => {
                this.handleError('Error fetching project stats from server');
            })
            .finally(() => {
                this.loading = false;
            });
    }

    private navigateToProfile(nostrPubKey: string): void {
        this.router.navigate(['/profile', nostrPubKey]);
    }

    filterByQuery(query: string): void {
        if (!query || query.trim() === '') {
            this.filteredProjects = [...this.projects];
            this.showCloseSearchButton = false;
            this.changeDetectorRef.detectChanges();
            return;
        }

        const lowerCaseQuery = query.toLowerCase();

        this.filteredProjects = this.projects.filter((project) => {
            return (
                (project.displayName &&
                    project.displayName
                        .toLowerCase()
                        .includes(lowerCaseQuery)) ||
                (project.about &&
                    project.about.toLowerCase().includes(lowerCaseQuery)) ||
                (project.displayName &&
                    project.displayName
                        .toLowerCase()
                        .includes(lowerCaseQuery)) ||
                (project.nostrPubKey &&
                    project.nostrPubKey
                        .toLowerCase()
                        .includes(lowerCaseQuery)) ||
                (project.projectIdentifier &&
                    project.projectIdentifier
                        .toLowerCase()
                        .includes(lowerCaseQuery))
            );
        });

        this.showCloseSearchButton = this.projects.length > 0;

        this.changeDetectorRef.detectChanges();
    }

    resetSearch(queryInput: HTMLInputElement): void {
        queryInput.value = '';
        this.filterByQuery('');
        this.showCloseSearchButton = false;
    }

    toggleCompleted(event: any): void {}

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private handleError(message: string): void {
        console.error(message);
        this.errorMessage = message;
        this.loading = false;
        this.changeDetectorRef.detectChanges();
    }

    getSafeUrl(url: any, isBanner: boolean): SafeUrl {
        if (url && typeof url === 'string' && this.isImageUrl(url)) {
            return this.sanitizer.bypassSecurityTrustUrl(url);
        } else {
            const defaultImage = isBanner
                ? '/images/pages/profile/cover.jpg'
                : 'images/avatars/avatar-placeholder.png';
            return this.sanitizer.bypassSecurityTrustUrl(defaultImage);
        }
    }

    private isImageUrl(url: string): boolean {
        return /\.(jpeg|jpg|gif|png|svg|bmp|webp|tiff|ico)$/i.test(url);
    }

    async openChat(publicKey: string): Promise<void> {
        try {
            const metadata =
                await this.metadataService.fetchMetadataWithCache(publicKey);

            if (metadata) {
                const contact: Contact = {
                    pubKey: publicKey,
                    name: metadata.name || 'Unknown',
                    picture:
                        metadata.picture ||
                        '/images/avatars/avatar-placeholder.png',
                    about: metadata.about || '',
                    displayName:
                        metadata.displayName || metadata.name || 'Unknown',
                };

                this._chatService
                    .getChatById(contact.pubKey, contact)
                    .subscribe((chat) => {
                        this.router.navigate(['/chat', contact.pubKey]);
                    });
            } else {
                console.error(
                    'No metadata found for the public key:',
                    publicKey
                );
            }
        } catch (error) {
            console.error('Error opening chat:', error);
        }
    }
}
