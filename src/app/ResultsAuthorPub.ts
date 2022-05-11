import { Book } from './Model/Book';

export class ResultsAuthorPub {
  constructor(
    private name: string,
    private books: Book[],
    private type: string
  ) {
    this.loadDisplayer();
  }

  loadDisplayer() {
    document.getElementById('displayer')?.remove();
    const element = document.createElement('div');
    const works = document.createElement('div');
    this.books.forEach((book) => {
      const work = document.createElement('div');
      work.innerHTML = book.title;
      work.classList.add('work');
      works.appendChild(work);
    });
    works.classList.add('works');
    element.innerHTML = `
        <div class="name">${this.name}</div>
        <div class="type">${this.type}</div>
        <button id="closeResultPage" title="close"></button>
    `;
    element.appendChild(works);
    element.id = 'displayer';
    element.classList.add('displayer');
    document.body.appendChild(element);
    document
      .getElementById('closeResultPage')
      ?.addEventListener('click', () => {
        element.remove();
      });
    setTimeout(() => {
      element.remove();
    }, 10000);
  }
}
