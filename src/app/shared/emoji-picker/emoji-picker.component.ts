import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { EmojiService } from '../../services/emoji.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.css'],
})
export class EmojiPickerComponent implements OnInit {
  @Output() emojiSelected = new EventEmitter<string>();
  public emojiSearch: string = '';
  public emojiCategories: { [key: string]: { name: string, emoji: string }[] } = {};
  public loading: boolean = true;
  private searchSubject = new Subject<string>();

  constructor(private emojiService: EmojiService) {}

  ngOnInit(): void {
    this.emojiService.getEmojis().subscribe(
      (data) => {
        this.emojiCategories = this.formatEmojis(data);
        this.loading = false;
      },
      (error) => {
        console.error('Error loading emoji data', error);
        this.loading = false;
      }
    );

    // Subscribe to search input changes with debounce
    this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after the last event before emitting
      distinctUntilChanged() // Only emit when the current value is different than the last
    ).subscribe((searchTerm) => {
      this.emojiSearch = searchTerm;
    });
  }

  formatEmojis(data: any): { [key: string]: { name: string, emoji: string }[] } {
    const formattedCategories: { [key: string]: { name: string, emoji: string }[] } = {};

    Object.keys(data).forEach((categoryName) => {
      formattedCategories[categoryName] = data[categoryName].map((emojiObj: any) => ({
        name: emojiObj.name,
        emoji: emojiObj.emoji,
      }));
    });

    return formattedCategories;
  }

  get filteredEmojiCategories(): { [key: string]: { name: string, emoji: string }[] } {
    if (!this.emojiSearch) return this.emojiCategories;

    const search = this.emojiSearch.toLowerCase();
    const filteredCategories: { [key: string]: { name: string, emoji: string }[] } = {};

    Object.keys(this.emojiCategories).forEach((category) => {
      const filteredEmojis = this.emojiCategories[category].filter((emojiObj) =>
        emojiObj.name.toLowerCase().includes(search)
      );
      if (filteredEmojis.length > 0) {
        filteredCategories[category] = filteredEmojis;
      }
    });

    return filteredCategories;
  }

  selectEmoji(emoji: string): void {
    this.emojiSelected.emit(emoji);
    this.emojiSearch = '';
  }

  onSearchChange(searchValue: string): void {
    this.searchSubject.next(searchValue); // Emit search value to debounce
  }
}
