import { Injectable } from '@angular/core';
import { Project } from 'app/interface/project.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StateService {
    private projects: Project[] = [];
    private projectsSubject = new BehaviorSubject<Project[]>([]);

    getProjectsObservable() {
        return this.projectsSubject.asObservable();
    }

    setProjects(projects: Project[]): void {
        this.projects = projects;
        this.projectsSubject.next(this.projects);
    }

    getProjects(): Project[] {
        return this.projects;
    }

    hasProjects(): boolean {
        return this.projects.length > 0;
    }

    updateProject(project: Project): void {
        const index = this.projects.findIndex(
            (p) => p.nostrPubKey === project.nostrPubKey
        );

        if (index > -1) {
            this.projects[index] = project;
        } else {
            this.projects.push(project);
        }

        this.projectsSubject.next(this.projects);
    }

    getProjectByPubKey(nostrPubKey: string): Project | undefined {
        return this.projects.find((p) => p.nostrPubKey === nostrPubKey);
    }
}
