// load số liệu từ localStorage để dashboard hoạt động
const KEY = "library_books_v2";
const books = JSON.parse(localStorage.getItem(KEY) || "[]");

document.getElementById("statTotal").textContent = books.length;
document.getElementById("statAuthors").textContent =
    new Set(books.map(b => b.author)).size;
document.getElementById("statIsbns").textContent =
    new Set(books.map(b => b.isbn)).size;
const KEY = "library_books_v2";
let books = JSON.parse(localStorage.getItem(KEY) || "[]");

const tbody = document.getElementById("booksTbody");
const modal = new bootstrap.Modal(document.getElementById("bookModal"));
const bookForm = document.getElementById("bookForm");

function render() {
    const q = searchInput.value.toLowerCase();
    tbody.innerHTML = "";

    books
        .filter(b =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.isbn.toLowerCase().includes(q)
        )
        .forEach((b, i) => {
            tbody.innerHTML += `
        <tr>
          <td>${i+1}</td>
          <td>${b.title}</td>
          <td>${b.author}</td>
          <td>${b.year}</td>
          <td>${b.isbn}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="editBook('${b.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteBook('${b.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
        });
}

btnAdd.onclick = () => {
    document.getElementById("modalTitle").textContent = "Thêm sách";
    bookId.value = "";
    title.value = "";
    author.value = "";
    year.value = "";
    isbn.value = "";
    modal.show();
};

function editBook(id) {
    const b = books.find(x => x.id === id);
    document.getElementById("modalTitle").textContent = "Sửa sách";
    bookId.value = b.id;
    title.value = b.title;
    author.value = b.author;
    year.value = b.year;
    isbn.value = b.isbn;
    modal.show();
}

function deleteBook(id) {
    books = books.filter(b => b.id !== id);
    localStorage.setItem(KEY, JSON.stringify(books));
    render();
}

bookForm.onsubmit = (event) => {
    event.preventDefault();

    const id = bookId.value || String(Date.now());
    const book = {
        id,
        title: title.value.trim(),
        author: author.value.trim(),
        year: year.value,
        isbn: isbn.value.trim()
    };

    if (bookId.value) {
        books = books.map(b => (b.id === id ? book : b));
    } else {
        books.push(book);
    }

    localStorage.setItem(KEY, JSON.stringify(books));
    modal.hide();
    render();
};

searchInput.oninput = render;

render();