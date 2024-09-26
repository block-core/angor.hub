// src/app/services/hash.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HashService {
  private timestamp: string | null = null;

  constructor(private http: HttpClient) {}

  async load() {
    const response = await fetch('/ngsw.json');

    if (response.ok) {
      const data = await response.json();
      console.log('DATA FROM HASH', data);
      this.timestamp = data.timestamp;
    }
  }

  // loadHash(): Promise<void> {
  //   return this.http
  //     .get('/ngsw.json')
  //     .toPromise()
  //     .then((data: any) => {
  //       this.hash = data.hash;
  //     })
  //     .catch(() => {
  //       this.hash = null;
  //     });
  // }

  getTimestamp(): string | null {
    return this.timestamp;
  }
}
