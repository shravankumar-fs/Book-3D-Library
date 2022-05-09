import { Book } from './Model/Book';

export class ResultPage {
  constructor(private book: Book) {
    this.loadDisplayer();
  }

  loadDisplayer() {
    document.getElementById('displayer')?.remove();
    const element = document.createElement('div');
    element.innerHTML = `
        <div class="title">${this.book.title}</div>
        <button id="closeResultPage" title="close"></button>
        <img class="coverpic" src=${this.book.image} alt='No Book image :(' />
        <div class="author">${this.book.author}</div>
        <div class="pub">${this.book.publisher}</div>
        <div class="isbn">${this.book.isbn}
        <button id="isbncopy" title="copy to clipboard"><img src='resources/clipboard.png'/></button>
        </div>
    `;
    element.id = 'displayer';
    element.classList.add('displayer');
    document.body.appendChild(element);
    document.getElementById('isbncopy')?.addEventListener('click', () => {
      navigator.clipboard.writeText(this.book.isbn);
    });
    document
      .getElementById('closeResultPage')
      ?.addEventListener('click', () => {
        element.remove();
      });
    setTimeout(() => {
      element.remove();
    }, 5000);
  }
}
