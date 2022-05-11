import { Book } from '../Model/Book';
import * as data from './results.json';

export class DataLoader {
  bookList: Book[] = [];
  filteredList: Book[] = [];
  bookStore = new Map<string, Book>();
  authorStore = new Map<string, Book[]>();
  publisherStore = new Map<string, Book[]>();
  constructor() {
    for (let i = 0; i < 1999; i++) {
      this.bookList.push(data[i] as Book);
    }
    this.resetFilteredList();
    this.bookList.forEach((item) => {
      this.bookStore.set(item.isbn, item);
      if (!this.authorStore.get(item.author))
        this.authorStore.set(item.author, [item]);
      else {
        this.authorStore.get(item.author)?.push(item);
      }
      if (!this.publisherStore.get(item.publisher))
        this.publisherStore.set(item.publisher, [item]);
      else {
        this.publisherStore.get(item.publisher)?.push(item);
      }
    });
  }

  resetFilteredList() {
    this.sortList();
    this.filteredList = this.bookList;
  }

  addBook(book: Book) {
    this.bookList.push(book);
    this.bookStore.set(book.isbn, book);
    this.resetFilteredList();
  }

  sortList() {
    this.bookList.sort((a, b) =>
      a.author > b.author ? 1 : b.author > a.author ? -1 : 0
    );
  }
}
