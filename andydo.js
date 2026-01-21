/*********************************
 * Configuration
 *********************************/
const STORAGE_KEY = "andydo_tasks";

/*********************************
 * State
 *********************************/

// Load tasks from localStorage or start with an empty array
let tasks = loadTasks();

/*********************************
 * Persistence helpers
 *********************************/

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse stored tasks", e);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/*********************************
 * Data access layer
 * (API-shaped on purpose)
 *********************************/

function fetchTasks() {
  // Later: return fetch('/api/tasks/list').then(r => r.json());
  return Promise.resolve(tasks);
}

function createTask(title) {
  const task = {
    id: Date.now(),       // simple unique ID
    title: title,
    completed: false
  };

  tasks.push(task);
  saveTasks();

  return Promise.resolve(task);
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);

  if (task) {
    task.completed = !task.completed;
    saveTasks();
  }

  return Promise.resolve(task);
}

/*********************************
 * UI logic
 *********************************/

const taskList = document.getElementById("taskList");
const form = document.getElementById("taskForm");
const titleInput = document.getElementById("title");

function renderTasks() {
  fetchTasks().then(tasks => {
    taskList.innerHTML = "";

    // Empty state
    if (tasks.length === 0) {
      const empty = document.createElement("li");
      empty.textContent = "No tasks yet";
      empty.style.color = "#777";
      empty.style.padding = "0.75rem";
      taskList.appendChild(empty);
      return;
    }

    tasks.forEach(task => {
      const li = document.createElement("li");
      li.className = "task" + (task.completed ? " completed" : "");

      const titleSpan = document.createElement("span");
      titleSpan.textContent = task.title;

      const toggleButton = document.createElement("button");
      toggleButton.textContent = "✓";
      toggleButton.addEventListener("click", () => {
        toggleTask(task.id).then(renderTasks);
      });

      li.appendChild(titleSpan);
      li.appendChild(toggleButton);
      taskList.appendChild(li);
    });
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) return;

  createTask(title).then(() => {
    form.reset();
    renderTasks();
  });
});

// Initial render
renderTasks();
