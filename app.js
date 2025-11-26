console.log("Task Visualizer - Progress Focus");

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#title");
const goalInput = document.querySelector("#goal");
const urgencySelect = document.querySelector("#urgency");
const tasksContainer = document.querySelector("#tasks-container");
const tasksSummary = document.querySelector("#tasks-summary");

console.log("Form encontrado:", form);

let tasks = [];
let nextId = 1;

form.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const goal = goalInput.value.trim();
  const urgency = urgencySelect.value;

  if (!title) {
    alert("Coloca um título na tarefa, criatura 🐒");
    return;
  }

  const newTask = {
    id: nextId++,
    title,
    goal,
    urgency,
    progress: 0, 
  };

  tasks.push(newTask);
  console.log("Tasks atuais:", tasks);

  renderTasks();
  form.reset();
  titleInput.focus();
}

function renderTasks() {
  tasksContainer.innerHTML = "";

  if (tasks.length === 0) {
    tasksContainer.innerHTML = `
      <div class="empty-state">
        Nenhuma tarefa ainda. Começa criando uma no formulário ao lado
        e ajusta o progresso com o slider de 0 a 100%.
      </div>
    `;
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

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "card border-secondary bg-transparent";

    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-2 gap-2">
          <div class="flex-grow-1">
            <h3 class="h6 mb-1">${escapeHtml(task.title)}</h3>
            ${
              task.goal
                ? `<p class="mb-1 text-secondary small">
                     Meta de aprendizado: ${escapeHtml(task.goal)}
                   </p>`
                : ""
            }
          </div>
          <span class="badge text-uppercase small ${
            getUrgencyBadgeClass(task.urgency)
          }">
            ${getUrgencyLabel(task.urgency)}
          </span>
        </div>

        <div class="mb-2">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="progress-label text-secondary">Progresso</span>
            <span class="progress-label" data-progress-label="${task.id}">
              ${task.progress}%
            </span>
          </div>
          <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100">
            <div
              class="progress-bar"
              style="width: ${task.progress}%"
              data-progress-bar="${task.id}"
            ></div>
          </div>
        </div>

        <div>
          <input
            type="range"
            class="form-range"
            min="0"
            max="100"
            step="20"
            value="${task.progress}"
            data-progress-slider="${task.id}"
            aria-label="Definir progresso da tarefa em passos de 20%"
          />
          <div class="d-flex justify-content-between mt-1 progress-label text-secondary">
            <span>0%</span>
            <span>20%</span>
            <span>40%</span>
            <span>60%</span>
            <span>80%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    `;

    tasksContainer.appendChild(card);
  });

  attachSliderListeners();
}

function attachSliderListeners() {
  const sliders = document.querySelectorAll("[data-progress-slider]");

  sliders.forEach((slider) => {
    slider.addEventListener("input", (event) => {
      const id = Number(event.target.getAttribute("data-progress-slider"));
      const newValue = Number(event.target.value);

      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      task.progress = newValue;

      const bar = document.querySelector(`[data-progress-bar="${id}"]`);
      const label = document.querySelector(
        `[data-progress-label="${id}"]`
      );

      if (bar) {
        bar.style.width = `${newValue}%`;
      }
      if (label) {
        label.textContent = `${newValue}%`;
      }

      const total = tasks.length;
      const avg =
        tasks.reduce((sum, task) => sum + task.progress, 0) /
        Math.max(total, 1);
      tasksSummary.innerHTML = `
        <div>Total: <strong>${total}</strong> tarefa(s)</div>
        <div>Média de progresso: <strong>${Math.round(avg)}%</strong></div>
      `;
    });
  });
}

function getUrgencyLabel(urgency) {
  if (urgency === "low") return "Baixa";
  if (urgency === "medium") return "Média";
  if (urgency === "high") return "Alta";
  return "Desconhecida";
}

function getUrgencyBadgeClass(urgency) {
  if (urgency === "low") return "badge-urgency-low";
  if (urgency === "medium") return "badge-urgency-medium";
  if (urgency === "high") return "badge-urgency-high";
  return "bg-secondary";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

renderTasks();