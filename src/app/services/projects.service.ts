import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IndexedDBService } from './indexed-db.service';
import { IndexerService } from './indexer.service';

export interface Project {
    founderKey: string;
    nostrPubKey: string;
    projectIdentifier: string;
    createdOnBlock: number;
    trxId: string;
    totalInvestmentsCount: number;
}

export interface ProjectStats {
    investorCount: number;
    amountInvested: number;
    amountSpentSoFarByFounder: number;
    amountInPenalties: number;
    countInPenalties: number;
}

@Injectable({
    providedIn: 'root',
})
export class ProjectsService {
    private offset = 0;
    private limit = 20;
    private totalProjects = 0;
    private loading = false;
    private projects: Project[] = [];
    private noMoreProjects = false;
    private totalProjectsFetched = false;
    selectedNetwork: 'mainnet' | 'testnet' = 'testnet';

    constructor(
        private http: HttpClient,
        private indexerService: IndexerService,
        private indexedDBService: IndexedDBService
    ) {
        this.loadNetwork();
    }

    loadNetwork() {
        this.selectedNetwork = this.indexerService.getNetwork();
    }

    async fetchProjects(): Promise<Project[]> {
        if (this.loading || this.noMoreProjects) {
            return [];
        }

        this.loading = true;
        const indexerUrl = this.indexerService.getPrimaryIndexer(
            this.selectedNetwork
        );
        const url = this.totalProjectsFetched
            ? `${indexerUrl}api/query/Angor/projects?offset=${this.offset}&limit=${this.limit}`
            : `${indexerUrl}api/query/Angor/projects?limit=${this.limit}`;

        try {
            const response = await this.http
                .get<Project[]>(url, { observe: 'response' })
                .toPromise();

            if (!this.totalProjectsFetched && response && response.headers) {
                const paginationTotal =
                    response.headers.get('pagination-total');
                this.totalProjects = paginationTotal ? +paginationTotal : 0;
                this.totalProjectsFetched = true;
                this.offset = Math.max(this.totalProjects - this.limit, 0);
            }

            const newProjects = response?.body || [];

            if (!newProjects.length) {
                this.noMoreProjects = true;
                return [];
            }

            const uniqueNewProjects = newProjects.filter(
                (newProject) =>
                    !this.projects.some(
                        (existingProject) =>
                            existingProject.projectIdentifier ===
                            newProject.projectIdentifier
                    )
            );

            if (!uniqueNewProjects.length) {
                this.noMoreProjects = true;
                return [];
            }

            const saveProjectsPromises = uniqueNewProjects.map(
                async (project) => {
                    await this.indexedDBService.saveProject(project);
                }
            );

            const projectDetailsPromises = uniqueNewProjects.map(
                async (project) => {
                    try {
                        const projectStats =
                            await this.indexedDBService.getProjectStats(
                                project.projectIdentifier
                            );
                        project.totalInvestmentsCount =
                            projectStats?.investorCount ?? 0;
                        return project;
                    } catch (error) {
                        console.error(
                            `Error fetching details for project ${project.projectIdentifier}:`,
                            error
                        );
                        return project;
                    }
                }
            );

            await Promise.all([
                ...saveProjectsPromises,
                ...projectDetailsPromises,
            ]);

            this.projects = [...this.projects, ...uniqueNewProjects];
            this.offset = Math.max(this.offset - this.limit, 0);

            return uniqueNewProjects;
        } catch (error) {
            console.error('Error fetching projects:', error);
            return [];
        } finally {
            this.loading = false;
        }
    }

    fetchProjectStats(projectIdentifier: string): Observable<ProjectStats> {
        const indexerUrl = this.indexerService.getPrimaryIndexer(
            this.selectedNetwork
        );
        const url = `${indexerUrl}api/query/Angor/projects/${projectIdentifier}/stats`;
        return this.http.get<ProjectStats>(url).pipe(
            catchError((error) => {
                console.error(
                    `Error fetching stats for project ${projectIdentifier}:`,
                    error
                );
                return of({} as ProjectStats);
            })
        );
    }

    async fetchAndSaveProjectStats(
        projectIdentifier: string
    ): Promise<ProjectStats | null> {
        try {
            const stats =
                await this.fetchProjectStats(projectIdentifier).toPromise();
            if (stats) {
                await this.indexedDBService.saveProjectStats(
                    projectIdentifier,
                    stats
                );
            }
            return stats;
        } catch (error) {
            console.error(
                `Error fetching and saving stats for project ${projectIdentifier}:`,
                error
            );
            return null;
        }
    }

    fetchProjectDetails(projectIdentifier: string): Observable<Project> {
        const indexerUrl = this.indexerService.getPrimaryIndexer(
            this.selectedNetwork
        );
        const url = `${indexerUrl}api/query/Angor/projects/${projectIdentifier}`;
        return this.http.get<Project>(url).pipe(
            catchError((error) => {
                console.error(
                    `Error fetching details for project ${projectIdentifier}:`,
                    error
                );
                return of({} as Project);
            })
        );
    }

    async fetchAndSaveProjectDetails(
        projectIdentifier: string
    ): Promise<Project | null> {
        try {
            const project =
                await this.fetchProjectDetails(projectIdentifier).toPromise();
            if (project) {
                await this.indexedDBService.saveProject(project);
            }
            return project;
        } catch (error) {
            console.error(
                `Error fetching and saving details for project ${projectIdentifier}:`,
                error
            );
            return null;
        }
    }

    async getAllProjectsFromDB(): Promise<Project[]> {
        return this.indexedDBService.getAllProjects();
    }

    async getProjectStatsFromDB(
        projectIdentifier: string
    ): Promise<ProjectStats | null> {
        return this.indexedDBService.getProjectStats(projectIdentifier);
    }

    getProjects(): Project[] {
        return this.projects;
    }

    resetProjects(): void {
        this.projects = [];
        this.noMoreProjects = false;
        this.offset = 0;
        this.totalProjectsFetched = false;
    }
}
