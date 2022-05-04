import { Book } from '../Model/Book';
import * as data from './results.json';

export class DataLoader {
  bookList: Book[] = [];
  filteredList: Book[] = [];
  bookStore = new Map<string, Book>();
  authorStore = new Map<string, number>();
  constructor() {
    for (let i = 0; i < 3999; i++) {
      this.bookList.push(data[i] as Book);
    }
    this.resetFilteredList();
    this.bookList.forEach((item) => {
      this.bookStore.set(item.isbn, item);
      if (!this.authorStore.get(item.author))
        this.authorStore.set(item.author, 0xffffff * Math.random());
    });
  }

  resetFilteredList() {
    this.filteredList = this.bookList;
  }

  addBook(book: Book) {
    this.bookList.push(book);
    this.bookStore.set(book.isbn, book);

    this.resetFilteredList();
  }
}
