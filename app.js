console.log("Task Visualizer - Jira Style (subtasks-driven progress)");

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#title");
const goalInput = document.querySelector("#goal");
const urgencySelect = document.querySelector("#urgency");
const difficultySelect = document.querySelector("#difficulty");
const tasksContainer = document.querySelector("#tasks-container");
const tasksSummary = document.querySelector("#tasks-summary");
const taskSound = new Audio("bem-te-vi-cantando.mp3");

console.log("Form encontrado:", form);

let tasks = [];
let nextTaskId = 1;
let nextSubtaskId = 1;

form.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const goal = goalInput.value.trim();
  const urgency = urgencySelect.value;
  const difficulty = difficultySelect.value;

  if (!title) {
    alert("Coloca um título na tarefa, criatura 🐒");
    return;
  }

  const newTask = {
    id: nextTaskId++,
    title,
    goal,
    urgency,
    difficulty,
    progress: 0,
    subtasks: [],
  };

  tasks.push(newTask);

  taskSound.currentTime = 0;
  taskSound.play();

  renderTasks();
  form.reset();
  titleInput.focus();
}


function recomputeTaskProgress(task) {
  const total = task.subtasks.length;
  if (total === 0) {
    task.progress = 0;
    return;
  }

  const done = task.subtasks.filter((s) => s.done).length;
  const percent = (done / total) * 100;
  task.progress = Math.round(percent);
}

function renderTasks() {
  tasksContainer.innerHTML = "";

  tasks.forEach(recomputeTaskProgress);

  if (tasks.length === 0) {
    tasksContainer.innerHTML = `
      <div class="empty-state">
        Nenhuma tarefa ainda.<br />
        Crie uma tarefa ao lado, adicione subtarefas e veja o progresso subir conforme você marca as subtarefas como concluídas.
      </div>
    `;
    tasksSummary.textContent = "";
    return;
  }

  updateSummary();

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "card bg-body-tertiary border-secondary";

    const subtasksHtml = task.subtasks
      .map(
        (sub) => `
        <li class="subtask-item d-flex align-items-center gap-2">
          <input
            class="form-check-input subtask-checkbox"
            type="checkbox"
            data-subtask-toggle="${task.id}:${sub.id}"
            ${sub.done ? "checked" : ""}
          />
          <span class="subtask-text ${sub.done ? "subtask-done" : ""}">
            ${escapeHtml(sub.title)}
          </span>
        </li>
      `
      )
      .join("");

    card.innerHTML = `
      <div class="card-body jira-card-body">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div class="flex-grow-1">
            <h3 class="task-title mb-1">${escapeHtml(task.title)}</h3>
            ${
              task.goal
                ? `<p class="task-goal mb-2">${escapeHtml(task.goal)}</p>`
                : ""
            }
          </div>

          <div class="d-flex flex-column align-items-end gap-1">
            <span class="badge rounded-pill badge-urgency ${getUrgencyBadgeClass(
              task.urgency
            )}">
              ${getUrgencyLabel(task.urgency)}
            </span>

            <span class="badge rounded-pill badge-difficulty ${getDifficultyBadgeClass(
              task.difficulty
            )}">
              ${getDifficultyLabel(task.difficulty)}
            </span>
          </div>
        </div>

        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="label-small">Progresso</span>
            <span class="label-small" data-progress-label="${task.id}">
              ${task.progress}%
            </span>
          </div>

          <div class="progress rounded-2 progress-container" role="progressbar" aria-valuemin="0" aria-valuemax="100">
            <div
              class="progress-bar progress-bar-animated ${getProgressBarClass(
                task.progress
              )}"
              style="width: ${task.progress}%"
              data-progress-bar="${task.id}"
            ></div>
          </div>
        </div>

        <div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="label-small">Subtarefas</span>
            <span class="label-small">${getSubtaskStats(task)}</span>
          </div>

          <ul class="subtasks-list mb-3">
            ${
              subtasksHtml ||
              `<li class="subtask-empty">Nenhuma subtarefa ainda.</li>`
            }
          </ul>

          <div class="input-group input-group-sm">
            <input
              type="text"
              class="form-control"
              placeholder="Adicionar subtarefa..."
              data-subtask-input="${task.id}"
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              data-add-subtask="${task.id}"
            >
              +
            </button>
          </div>
        </div>
      </div>
    `;

    tasksContainer.appendChild(card);
  });

  attachEventListeners();
}

function attachEventListeners() {
  const addButtons = document.querySelectorAll("[data-add-subtask]");
  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const taskId = Number(btn.getAttribute("data-add-subtask"));
      const input = document.querySelector(
        `[data-subtask-input="${taskId}"]`
      );
      if (!input) return;

      const value = input.value.trim();
      if (!value) return;

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const newSubtask = {
        id: nextSubtaskId++,
        title: value,
        done: false,
      };

      task.subtasks.push(newSubtask);
      recomputeTaskProgress(task);
      input.value = "";
      renderTasks();
    });
  });

  const subtaskToggles = document.querySelectorAll("[data-subtask-toggle]");
  subtaskToggles.forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const [taskIdStr, subIdStr] = event.target
        .getAttribute("data-subtask-toggle")
        .split(":");
      const taskId = Number(taskIdStr);
      const subId = Number(subIdStr);

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const sub = task.subtasks.find((s) => s.id === subId);
      if (!sub) return;

      sub.done = event.target.checked;
      recomputeTaskProgress(task);
      renderTasks();
    });
  });
}

function updateSummary() {
  if (tasks.length === 0) {
    tasksSummary.textContent = "";
    return;
  }

  const total = tasks.length;
  const avg =
    tasks.reduce((sum, task) => sum + task.progress, 0) / Math.max(total, 1);

  tasksSummary.innerHTML = `
    <div>Total: <strong>${total}</strong> tarefa(s)</div>
    <div>Média de progresso: <strong>${Math.round(avg)}%</strong></div>
  `;
}

function getUrgencyLabel(urgency) {
  if (urgency === "low") return "Urgência baixa";
  if (urgency === "medium") return "Urgência média";
  if (urgency === "high") return "Urgência alta";
  return "Urgência desconhecida";
}

function getDifficultyLabel(difficulty) {
  if (difficulty === "easy") return "Fácil";
  if (difficulty === "medium") return "Média";
  if (difficulty === "hard") return "Difícil";
  return "Desconhecida";
}

function getUrgencyBadgeClass(urgency) {
  if (urgency === "low") return "badge-urgency-low";
  if (urgency === "medium") return "badge-urgency-medium";
  if (urgency === "high") return "badge-urgency-high";
  return "bg-secondary";
}

function getDifficultyBadgeClass(difficulty) {
  if (difficulty === "easy") return "badge-difficulty-easy";
  if (difficulty === "medium") return "badge-difficulty-medium";
  if (difficulty === "hard") return "badge-difficulty-hard";
  return "bg-secondary";
}

function getProgressBarClass(progress) {
  if (progress === 0) return "progress-bar-low";
  if (progress <= 40) return "progress-bar-low";
  if (progress <= 70) return "progress-bar-medium";
  return "progress-bar-high";
}

function getSubtaskStats(task) {
  const total = task.subtasks.length;
  if (total === 0) return "0/0 concluídas";

  const done = task.subtasks.filter((s) => s.done).length;
  return `${done}/${total} concluídas`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

renderTasks();
