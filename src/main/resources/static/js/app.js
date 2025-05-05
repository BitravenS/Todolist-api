const API_URL = "/api/todos";
let editingId = null;

document.addEventListener("DOMContentLoaded", loadTodos);

function loadTodos() {
    fetch(API_URL)
        .then(res => res.json())
        .then(todos => {
            const list = document.getElementById("todoList");
            list.innerHTML = "";
            todos.forEach(todo => {
                const item = document.createElement("li");
                item.className = "list-group-item d-flex justify-content-between align-items-center";

                const title = document.createElement("div");
                title.innerHTML = `<strong>${todo.title}</strong><br><small>${todo.description}</small>`;

                const actions = document.createElement("div");

                const editBtn = document.createElement("button");
                editBtn.className = "btn btn-warning btn-sm me-2";
                editBtn.textContent = "✏️";
                editBtn.onclick = () => openEditModal(todo);

                const deleteBtn = document.createElement("button");
                deleteBtn.className = "btn btn-danger btn-sm";
                deleteBtn.textContent = "🗑";
                deleteBtn.onclick = () => deleteTodo(todo.id);

                actions.appendChild(editBtn);
                actions.appendChild(deleteBtn);

                item.appendChild(title);
                item.appendChild(actions);
                list.appendChild(item);
            });
        });
}

function addTodo() {
    const title = document.getElementById("newTitle").value.trim();
    const description = document.getElementById("newDesc").value.trim();
    if (!title || !description) return;

    fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ title, description })
    }).then(() => {
        document.getElementById("newTitle").value = "";
        document.getElementById("newDesc").value = "";
        loadTodos();
    });
}

function deleteTodo(id) {
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(loadTodos);
}

function openEditModal(todo) {
    editingId = todo.id;
    document.getElementById("editTitle").value = todo.title;
    document.getElementById("editDesc").value = todo.description;
    new bootstrap.Modal(document.getElementById("editModal")).show();
}

function saveEdit() {
    const title = document.getElementById("editTitle").value.trim();
    const description = document.getElementById("editDesc").value.trim();
    if (!title || !description) return;

    fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ title, description })
    }).then(() => {
        editingId = null;
        bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
        loadTodos();
    });
}
