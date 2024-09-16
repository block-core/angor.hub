import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { StateService } from '../../services/state.service';
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
import { AngorCardComponent } from '@angor/components/card';
import { AngorFindByKeyPipe } from '@angor/pipes/find-by-key';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgClass, PercentPipe, I18nPluralPipe, CommonModule } from '@angular/common';
import { MetadataService } from 'app/services/metadata.service';
import { Subject, takeUntil } from 'rxjs';
import { IndexedDBService } from 'app/services/indexed-db.service';

interface Project {
  projectIdentifier: string;
  nostrPubKey: string;
  displayName?: string;
  about?: string;
  picture?: string;
  banner?:string
}

@Component({
  selector: 'explore',
  standalone: true,
  templateUrl: './explore.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatButtonModule, RouterLink, MatIconModule, AngorCardComponent,
    CdkScrollable, MatFormFieldModule, MatSelectModule, MatOptionModule,
    MatInputModule, MatSlideToggleModule, NgClass, MatTooltipModule,
    MatProgressBarModule, AngorFindByKeyPipe, PercentPipe, I18nPluralPipe, CommonModule
  ],
})
export class ExploreComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  errorMessage: string = '';
  loading: boolean = false;
  private metadataLoadLimit = 5;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  filteredProjects: Project[] = [];

  constructor(
    private projectService: ProjectsService,
    private router: Router,
    private stateService: StateService,
    private metadataService: MetadataService,
    private _indexedDBService: IndexedDBService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.projects = this.stateService.getProjects();
    this.filteredProjects = [...this.projects];
    if (this.projects.length === 0) {
      this.loadProjects();
    } else {
      this.loading = false;

      this.projects.forEach(project => this.subscribeToProjectMetadata(project));
    }

    this._indexedDBService.getMetadataStream()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((updatedMetadata) => {
        if (updatedMetadata) {
          const projectToUpdate = this.projects.find(p => p.nostrPubKey === updatedMetadata.pubkey);
          if (projectToUpdate) {
            this.updateProjectMetadata(projectToUpdate, updatedMetadata.metadata);
          }
        }
      });
  }

  loadProjects(): void {
    if (this.loading || this.errorMessage === 'No more projects found') return;

    this.loading = true;

    this.projectService.fetchProjects().then(async (projects: Project[]) => {
      if (projects.length === 0 && this.projects.length === 0) {
        this.errorMessage = 'No projects found';
      } else if (projects.length === 0) {
        this.errorMessage = 'No more projects found';
      } else {
        this.projects = [...this.projects, ...projects];
        this.filteredProjects = [...this.projects];

        const pubkeys = projects.map(project => project.nostrPubKey);
        await this.metadataService.fetchMetadataForMultipleKeys(pubkeys);

        this.stateService.setProjects(this.projects);

        this.projects.forEach(project => this.subscribeToProjectMetadata(project));
      }
      this.loading = false;
      this._changeDetectorRef.detectChanges();
    }).catch((error: any) => {
      console.error('Error fetching projects:', error);
      this.errorMessage = 'Error fetching projects. Please try again later.';
      this.loading = false;
      this._changeDetectorRef.detectChanges();
    });
  }


  async loadMetadataForProject(project: Project): Promise<void> {
    try {
      const metadata = await this.metadataService.fetchMetadataWithCache(project.nostrPubKey);
      if (metadata) {
        this.updateProjectMetadata(project, metadata);
      } else {
        console.warn(`No metadata found for project ${project.nostrPubKey}`);
      }
    } catch (error) {
      console.error(`Error fetching metadata for project ${project.nostrPubKey}:`, error);
    }
  }

  updateProjectMetadata(project: Project, metadata: any): void {
    const updatedProject: Project = {
      ...project,
      displayName: metadata.name,
      about: metadata.about,
      picture: metadata.picture,
      banner: metadata.banner
    };

    const index = this.projects.findIndex(p => p.projectIdentifier === project.projectIdentifier);
    if (index !== -1) {
      this.projects[index] = updatedProject;
      this.projects = [...this.projects];
    }

    this.filteredProjects = [...this.projects];
    this._changeDetectorRef.detectChanges();
  }

  subscribeToProjectMetadata(project: Project): void {
    this.metadataService.getMetadataStream()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((updatedMetadata: any) => {
        if (updatedMetadata && updatedMetadata.pubkey === project.nostrPubKey) {
          this.updateProjectMetadata(project, updatedMetadata.metadata);
        }
      });
  }

  goToProjectDetails(project: Project): void {
    this.router.navigate(['/projects', project.projectIdentifier]);
  }


  filterByQuery(query: string): void {
    if (!query) {
      this.filteredProjects = [...this.projects];
      return;
    }

    this.filteredProjects = this.projects.filter(project =>
      project.displayName?.toLowerCase().includes(query.toLowerCase()) ||
      project.about?.toLowerCase().includes(query.toLowerCase())
    );
  }


  toggleCompleted(event: any): void {

  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
