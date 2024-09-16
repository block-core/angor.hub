import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private projects: any[] = [];
  private projectsSubject = new BehaviorSubject<any[]>([]); // Stream for projects updates

  /**
   * Returns an observable for project updates.
   */
  getProjectsObservable() {
    return this.projectsSubject.asObservable();
  }

  /**
   * Sets the projects and emits the updated list.
   */
  setProjects(projects: any[]): void {
    this.projects = projects;
    this.projectsSubject.next(this.projects); // Emit updated projects
  }

  /**
   * Returns the current list of projects.
   */
  getProjects(): any[] {
    return this.projects;
  }

  /**
   * Returns a boolean indicating whether there are projects.
   */
  hasProjects(): boolean {
    return this.projects.length > 0;
  }

  /**
   * Updates or adds a project based on its nostrPubKey.
   */
  updateProject(project: any): void {
    const index = this.projects.findIndex(p => p.nostrPubKey === project.nostrPubKey);

    if (index > -1) {
      this.projects[index] = project;
    } else {
      this.projects.push(project);
    }

    this.projectsSubject.next(this.projects); // Emit updated projects
  }

  /**
   * Returns a specific project by its nostrPubKey.
   */
  getProjectByPubKey(nostrPubKey: string): any | undefined {
    return this.projects.find(p => p.nostrPubKey === nostrPubKey);
  }
}
