import { Injectable } from '@angular/core';
import { NostrService } from './nostr.service';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private projects: any[] = [];
  private metadataCache: Map<string, any> = new Map();

  constructor(private nostrService: NostrService) {}


  async setProjects(projects: any[]): Promise<void> {
    this.projects = projects;
    this.updateMetadataInBackground();
  }


  getProjects(): any[] {
    return this.projects;
  }


  hasProjects(): boolean {
    return this.projects.length > 0;
  }


  async updateProjectActivity(project: any): Promise<void> {
    const index = this.projects.findIndex(p => p.nostrPubKey === project.nostrPubKey);

    if (index > -1) {
      this.projects[index] = project;
    } else {
      this.projects.push(project);
    }

    this.projects.sort((a, b) => b.lastActivity - a.lastActivity);
    await this.updateMetadataForProject(project); // Ensure metadata is updated for the project
  }


  private updateMetadataInBackground(): void {
    const batchSize = 5;

    for (let i = 0; i < this.projects.length; i += batchSize) {
      const batch = this.projects.slice(i, i + batchSize);
      batch.forEach(project => this.updateMetadataForProject(project));
    }
  }

  private async updateMetadataForProject(project: any): Promise<void> {
    if (this.metadataCache.has(project.nostrPubKey)) {
      this.applyMetadata(project, this.metadataCache.get(project.nostrPubKey));
      return;
    }

    try {
      const metadata = await this.nostrService.fetchMetadata(project.nostrPubKey);

      if (metadata) {
        this.applyMetadata(project, metadata);
        this.metadataCache.set(project.nostrPubKey, metadata); // Cache the metadata
      } else {
        console.warn(`Metadata is null for project ${project.nostrPubKey}.`);
      }
    } catch (error) {
      console.error(`Error fetching metadata for project ${project.nostrPubKey}:`, error);
    }
  }


private applyMetadata(project: any, metadata: any): void {
  if (metadata && typeof metadata === 'object') {
    project.displayName = metadata.name || project.displayName;
    project.picture = metadata.picture || project.picture;
  } else {
    console.warn(`Metadata for project ${project.nostrPubKey} is invalid or null.`);
  }
}

}
