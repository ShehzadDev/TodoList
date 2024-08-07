document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todo-form");
  const titleInput = document.getElementById("todo-title");
  const descriptionInput = document.getElementById("todo-description");
  const todoList = document.getElementById("todo-list");

  let editingTodoId = null;

  // Fetch and display existing todos
  fetch("/api/todos")
    .then((response) => response.json())
    .then((todos) => {
      todos.forEach((todo) => {
        addTodoToDOM(todo);
      });
    });

  // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const todo = {
      title: titleInput.value,
      description: descriptionInput.value,
      completed: false,
    };

    if (editingTodoId) {
      // Update existing todo
      fetch(`/api/todos/${editingTodoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
      })
        .then((response) => response.json())
        .then((updatedTodo) => {
          updateTodoInDOM(updatedTodo);
          titleInput.value = "";
          descriptionInput.value = "";
          editingTodoId = null;
        });
    } else {
      // Create new todo
      fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
      })
        .then((response) => response.json())
        .then((newTodo) => {
          addTodoToDOM(newTodo, true);
          titleInput.value = "";
          descriptionInput.value = "";
        });
    }
  });

  // Function to add a todo item to the DOM
  function addTodoToDOM(todo, prepend = false) {
    const li = document.createElement("li");
    li.className =
      "flex flex-col items-start p-4 bg-white rounded mb-2 shadow-md transition-transform transform hover:scale-105";
    li.id = todo.id;

    const title = document.createElement("h2");
    title.className = "text-xl font-bold text-gray-800";
    title.textContent = todo.title;
    li.appendChild(title);

    const description = document.createElement("p");
    description.className = "text-gray-600 mb-2";
    description.textContent = todo.description;
    li.appendChild(description);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "flex justify-end space-x-2";

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className =
      "bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600";
    editButton.addEventListener("click", () => {
      titleInput.value = todo.title;
      descriptionInput.value = todo.description;
      editingTodoId = todo.id;
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className =
      "bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600";
    deleteButton.addEventListener("click", () => {
      fetch(`/api/todos/${todo.id}`, {
        method: "DELETE",
      }).then(() => {
        li.remove();
      });
    });

    buttonsContainer.appendChild(editButton);
    buttonsContainer.appendChild(deleteButton);

    li.appendChild(buttonsContainer);
    if (prepend) {
      todoList.prepend(li);
    } else {
      todoList.appendChild(li);
    }
  }

  // Function to update a todo item in the DOM
  function updateTodoInDOM(updatedTodo) {
    const li = document.getElementById(updatedTodo.id);
    li.querySelector("h2").textContent = updatedTodo.title;
    li.querySelector("p").textContent = updatedTodo.description;
  }
});
