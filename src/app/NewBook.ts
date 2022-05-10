import { generateUUID } from 'three/src/math/MathUtils';
import { DataLoader } from './DataProvider/DataLoader';
import { Book } from './Model/Book';

export class NewBook {
  HTMLDATA = `
    <div class="input">
        <label for="formtitle">Enter title </label>
        <input id="formtitle" placeholder="title.." required>
    </div>
    <div class="input">
        <label for="formauthor">Author of book </label>
        <input id="formauthor" placeholder="author.." required>
    </div>
    <div class="input">
        <label for="formpub">Publication </label>
        <input id="formpub" placeholder="publication.." required>
    </div>
    <div class="input">
        <label for="formimage">Image url (optional) </label>
        <input id="formimage" placeholder="image link..">
    </div>
  
    <div class="actions">
        <button id="formnewsubmit" type="submit">Submit</button>
        <button id="formnewcancel" class="cancel">Cancel</button>
    </div>
    
    `;

  constructor(addBook: Function, contentReset: Function) {
    document.getElementById('formnewbook')?.remove();
    const el = document.createElement('form');
    el.innerHTML = this.HTMLDATA;
    el.id = 'formnewbook';
    el.classList.add('formnewbook');

    document.body.appendChild(el);
    const titleEl = document.getElementById('formtitle') as HTMLInputElement;
    const authorEl = document.getElementById('formauthor') as HTMLInputElement;
    const pubEl = document.getElementById('formpub') as HTMLInputElement;
    const imageEl = document.getElementById('formimage') as HTMLInputElement;

    document.getElementById('formnewsubmit')?.addEventListener('click', () => {
      if (!titleEl.value || !authorEl.value || !pubEl.value) {
      } else {
        const book = new Book();
        book.title = titleEl.value;
        book.author = authorEl.value;
        book.publisher = pubEl.value;
        book.image = imageEl.value
          ? imageEl.value
          : 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg';
        book.isbn = generateUUID().split('-')[4];
        addBook(book);
        contentReset();
        el.remove();
      }
    });
    document.getElementById('formnewcancel')?.addEventListener('click', () => {
      el.remove();
    });
  }
}
