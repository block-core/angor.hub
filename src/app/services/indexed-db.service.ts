import { Injectable } from '@angular/core';
import localForage from 'localforage';
import { BehaviorSubject, Observable } from 'rxjs';
import { Project, ProjectStats } from './projects.service';
import { Chat } from 'app/components/chat/chat.types';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private metadataSubject = new BehaviorSubject<any>(null);
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  private projectStatsSubject = new BehaviorSubject<{ [key: string]: ProjectStats }>({});

  private userStore: LocalForage;
  private projectsStore: LocalForage;
  private projectStatsStore: LocalForage;
  private chatStore: LocalForage;
  private timestampStore: LocalForage;


  constructor() {

    this.userStore = localForage.createInstance({
      driver: localForage.INDEXEDDB,
      name: 'angor-hub',
      version: 1.0,
      storeName: 'users',
      description: 'Store for user metadata',
    });

    this.projectsStore = localForage.createInstance({
      driver: localForage.INDEXEDDB,
      name: 'angor-hub',
      version: 1.0,
      storeName: 'projects',
      description: 'Store for projects',
    });

    this.projectStatsStore = localForage.createInstance({
      driver: localForage.INDEXEDDB,
      name: 'angor-hub',
      version: 1.0,
      storeName: 'projectStats',
      description: 'Store for project statistics',
    });

    this.chatStore = localForage.createInstance({
        driver: localForage.INDEXEDDB,
        name: 'angor-hub',
        version: 1.0,
        storeName: 'chats',
        description: 'Store for chat information',
      });

      this.timestampStore = localForage.createInstance({
        driver: localForage.INDEXEDDB,
        name: 'angor-hub',
        version: 1.0,
        storeName: 'timestamps',
        description: 'Store for last update timestamps',
      });


    this.loadAllProjectsFromDB();
    this.loadAllProjectStatsFromDB();
  }

  getProjectsObservable(): Observable<Project[]> {
    return this.projectsSubject.asObservable();
  }

  async saveProject(project: Project): Promise<void> {
    try {
      await this.projectsStore.setItem(project.projectIdentifier, project);
      const updatedProjects = await this.getAllProjects();
      this.projectsSubject.next(updatedProjects);
    } catch (error) {
      console.error(`Error saving project ${project.projectIdentifier} to IndexedDB:`, error);
    }
  }

  async getProject(projectIdentifier: string): Promise<Project | null> {
    try {
      const project = await this.projectsStore.getItem<Project>(projectIdentifier);
      return project || null;
    } catch (error) {
      console.error(`Error getting project ${projectIdentifier} from IndexedDB:`, error);
      return null;
    }
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      const projects: Project[] = [];
      await this.projectsStore.iterate<Project, void>((value) => {
        projects.push(value);
      });
      return projects;
    } catch (error) {
      console.error('Error getting all projects from IndexedDB:', error);
      return [];
    }
  }

  getProjectStatsObservable(): Observable<{ [key: string]: ProjectStats }> {
    return this.projectStatsSubject.asObservable();
  }

  async saveProjectStats(projectIdentifier: string, stats: ProjectStats): Promise<void> {
    try {
      await this.projectStatsStore.setItem(projectIdentifier, stats);
      const updatedStats = await this.getAllProjectStats();
      this.projectStatsSubject.next(updatedStats);
    } catch (error) {
      console.error(`Error saving project stats for ${projectIdentifier} to IndexedDB:`, error);
    }
  }

  async getProjectStats(projectIdentifier: string): Promise<ProjectStats | null> {
    try {
      const stats = await this.projectStatsStore.getItem<ProjectStats>(projectIdentifier);
      return stats || null;
    } catch (error) {
      console.error(`Error getting project stats for ${projectIdentifier} from IndexedDB:`, error);
      return null;
    }
  }

  getMetadataStream(): Observable<any> {
    return this.metadataSubject.asObservable();
  }

  async getUserMetadata(pubkey: string): Promise<any | null> {
    try {
      const metadata = await this.userStore.getItem(pubkey);
      return metadata;
    } catch (error) {
      console.error('Error getting metadata from IndexedDB:', error);
      return null;
    }
  }

  async saveUserMetadata(pubKey: string, metadata: any): Promise<void> {
    try {
      metadata.pubKey=pubKey;
      await this.userStore.setItem(pubKey, metadata);
      this.metadataSubject.next({ pubKey, metadata });
    } catch (error) {
      console.error('Error saving metadata to IndexedDB:', error);
    }
  }

  async removeUserMetadata(pubkey: string): Promise<void> {
    try {
      await this.userStore.removeItem(pubkey);
      this.metadataSubject.next({ pubkey, metadata: null });
    } catch (error) {
      console.error('Error removing metadata from IndexedDB:', error);
    }
  }

  private async loadAllProjectsFromDB(): Promise<void> {
    try {
      const projects = await this.getAllProjects();
      this.projectsSubject.next(projects);
    } catch (error) {
      console.error('Error loading projects from IndexedDB:', error);
    }
  }

  async getAllProjectStats(): Promise<{ [key: string]: ProjectStats }> {
    try {
      const statsMap: { [key: string]: ProjectStats } = {};
      await this.projectStatsStore.iterate<ProjectStats, void>((value, key) => {
        statsMap[key] = value;
      });
      return statsMap;
    } catch (error) {
      console.error('Error getting all project stats from IndexedDB:', error);
      return {};
    }
  }

  private async loadAllProjectStatsFromDB(): Promise<void> {
    try {
      const stats = await this.getAllProjectStats();
      this.projectStatsSubject.next(stats);
    } catch (error) {
      console.error('Error loading project stats from IndexedDB:', error);
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const users: any[] = [];
      await this.userStore.iterate((value) => {
        users.push(value);
      });
      return users;
    } catch (error) {
      console.error('Error getting all users from IndexedDB:', error);
      return [];
    }
  }

  async clearAllMetadata(): Promise<void> {
    try {
      await this.userStore.clear();
      this.metadataSubject.next(null);
    } catch (error) {
      console.error('Error clearing all metadata:', error);
    }
  }


   async searchUsersByMetadata(query: string): Promise<{ pubkey: string, user: any }[]> {
    try {
      const matchingUsers: { pubkey: string, user: any }[] = [];
      const searchQuery = query.toLowerCase();

      await this.userStore.iterate<any, void>((user, pubkey) => {
        const userString = JSON.stringify(user).toLowerCase();
        if (userString.includes(searchQuery)) {
          matchingUsers.push({ pubkey, user });
        }
      });

      return matchingUsers;
    } catch (error) {
      console.error('Error searching users by metadata from IndexedDB:', error);
      return [];
    }
  }


  async saveChat(chat: Chat): Promise<void> {
    try {
      await this.chatStore.setItem(chat.id, chat);
    } catch (error) {
      console.error('Error saving chat to IndexedDB:', error);
    }
  }

  async getChat(pubKey: string): Promise<Chat | null> {
    try {
      const chat = await this.chatStore.getItem<Chat>(pubKey);
      if (chat) {
        return chat;
      } else {
        console.warn(`Chat with pubKey ${pubKey} not found in IndexedDB.`);
        return null;
      }
    } catch (error) {
      console.error(`Error retrieving chat with pubKey ${pubKey} from IndexedDB:`, error);
      return null;
    }
  }


  async getAllChats(): Promise<Chat[]> {
    try {
      const chats: Chat[] = [];

      await this.chatStore.iterate<Chat, void>((value) => {
        chats.push(value);
      });

      chats.sort((a, b) => {
        const dateA = Number(a.lastMessageAt);
        const dateB = Number(b.lastMessageAt);
        return dateB - dateA;
      });

      return chats;
    } catch (error) {
      console.error('Error getting chats from IndexedDB:', error);
      return [];
    }
  }


  async getAllChatsWithLastMessage(): Promise<Chat[]> {
    try {
        const chats: Chat[] = [];

        await this.chatStore.iterate<Chat, void>((value) => {
            const lastMessage = value.messages[value.messages.length - 1];

            const chatWithLastMessage = {
                ...value,
                messages: [lastMessage]
            };

            chats.push(chatWithLastMessage);
        });

        chats.sort((a, b) => {
            const dateA = Number(a.lastMessageAt);
            const dateB = Number(b.lastMessageAt);
            return dateB - dateA;
        });

        return chats;
    } catch (error) {
        console.error('Error getting chats with last message from IndexedDB:', error);
        return [];
    }
}




   async saveLastSavedTimestamp(timestamp: number): Promise<void> {
    try {
      await this.timestampStore.setItem('lastSavedTimestamp', timestamp);
    } catch (error) {
      console.error('Error saving last update timestamp in IndexedDB:', error);
    }
  }

  async getLastSavedTimestamp(): Promise<number> {
    try {
      const timestamp = await this.timestampStore.getItem<number>('lastSavedTimestamp');
      return timestamp || 0;
    } catch (error) {
      console.error('Error getting last saved timestamp from IndexedDB:', error);
      return 0;
    }
  }
}
