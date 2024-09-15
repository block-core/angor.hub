import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
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
import { MetadataService } from 'app/services/metadata-service.service';

interface Project {
  projectIdentifier: string;
  nostrPubKey: string;
  displayName?: string;
  about?: string;
  picture?: string;
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
filterByQuery(arg0: any) {
throw new Error('Method not implemented.');
}
toggleCompleted($event: any) {
throw new Error('Method not implemented.');
}
  projects: Project[] = [];
  errorMessage: string = '';
  loading: boolean = false;
  private metadataLoadLimit = 5;

  constructor(
    private projectService: ProjectsService,
    private router: Router,
    private stateService: StateService,
    private metadataService: MetadataService
  ) {}

  ngOnInit(): void {
    this.projects = this.stateService.getProjects();
    if (this.projects.length === 0) {
      this.loadProjects();
    } else {
      this.loading = false;
    }
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

        // for (let i = 0; i < projects.length; i += this.metadataLoadLimit) {
        //   const batch = projects.slice(i, i + this.metadataLoadLimit);
        //   await Promise.all(batch.map(project => this.loadMetadataForProject(project)));
        // }

        this.stateService.setProjects(this.projects);
      }
      this.loading = false;
    }).catch((error: any) => {
      console.error('Error fetching projects:', error);
      this.errorMessage = 'Error fetching projects. Please try again later.';
      this.loading = false;
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
    project.displayName = metadata.name;
    project.about = metadata.about;
    project.picture = metadata.picture;
  }

  goToProjectDetails(project: Project): void {
    this.router.navigate(['/projects', project.projectIdentifier]);
  }

  ngOnDestroy(): void {}
}
