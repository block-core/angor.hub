import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  private readonly EMOJI_URL = 'data/emoji.json';

  constructor(private http: HttpClient) {
    console.log('EmojiService initialized');
  }

  getEmojis(): Observable<any> {
    console.log('Fetching emojis from:', this.EMOJI_URL);
    return this.http.get<any>(this.EMOJI_URL);
  }
}
