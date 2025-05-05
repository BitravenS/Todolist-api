const API_URL = "/api/todos";
let editingId = null;
let currentFilter = "all";
let allTodos = [];

document.addEventListener("DOMContentLoaded", loadTodos);

function loadTodos() {
  fetch(API_URL)
    .then((res) => res.json())
    .then((todos) => {
      allTodos = todos;
      renderTodos();
    });
}

function renderTodos(todosToRender = allTodos) {
  const list = document.getElementById("todoList");
  list.innerHTML = "";

  if (todosToRender.length === 0) {
    list.innerHTML =
      '<li class="list-group-item text-center">Aucune tâche trouvée</li>';
    return;
  }

  todosToRender.forEach((todo) => {
    const item = document.createElement("li");
    item.className = `list-group-item d-flex justify-content-between align-items-center ${
      todo.completed ? "bg-light" : ""
    }`;

    const title = document.createElement("div");
    title.className = "flex-grow-1";
    title.innerHTML = `<strong style="${
      todo.completed ? "text-decoration: line-through; color: #6c757d;" : ""
    }">${todo.title}</strong><br>
                          <small>${todo.description}</small>`;

    const actions = document.createElement("div");

    const toggleBtn = document.createElement("button");
    toggleBtn.className = `btn btn-sm me-2 ${
      todo.completed ? "btn-outline-success" : "btn-success"
    }`;
    toggleBtn.innerHTML = todo.completed ? "↩️" : "✓";
    toggleBtn.title = todo.completed
      ? "Marquer comme non terminée"
      : "Marquer comme terminée";
    toggleBtn.onclick = () => toggleTodoStatus(todo.id);

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-warning btn-sm me-2";
    editBtn.textContent = "✏️";
    editBtn.onclick = () => openEditModal(todo);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger btn-sm";
    deleteBtn.textContent = "🗑";
    deleteBtn.onclick = () => deleteTodo(todo.id);

    actions.appendChild(toggleBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(title);
    item.appendChild(actions);
    list.appendChild(item);
  });
}

function addTodo() {
  const title = document.getElementById("newTitle").value.trim();
  const description = document.getElementById("newDesc").value.trim();
  if (!title || !description) return;

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  }).then(() => {
    document.getElementById("newTitle").value = "";
    document.getElementById("newDesc").value = "";
    loadTodos();
  });
}

function deleteTodo(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
    fetch(`${API_URL}/${id}`, { method: "DELETE" }).then(loadTodos);
  }
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  }).then(() => {
    editingId = null;
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
    loadTodos();
  });
}

function toggleTodoStatus(id) {
  fetch(`${API_URL}/${id}/toggle`, {
    method: "PATCH",
  }).then(() => loadTodos());
}

function searchTodos() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) {
    loadTodos();
    return;
  }

  fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`)
    .then((res) => res.json())
    .then((todos) => {
      allTodos = todos;
      applyFilter();
    });
}

function filterTodos(filter) {
  currentFilter = filter;

  // Update active button
  document.querySelectorAll(".btn-group .btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document
    .getElementById(`btn${filter.charAt(0).toUpperCase() + filter.slice(1)}`)
    .classList.add("active");

  applyFilter();
}

function applyFilter() {
  let filteredTodos = allTodos;

  if (currentFilter === "active") {
    filteredTodos = allTodos.filter((todo) => !todo.completed);
  } else if (currentFilter === "completed") {
    filteredTodos = allTodos.filter((todo) => todo.completed);
  }

  renderTodos(filteredTodos);
}
