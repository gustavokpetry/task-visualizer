console.log("Task Visualizer carregado");

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#title");
const goalInput = document.querySelector("#goal");
const urgencySelect = document.querySelector("#urgency");
const tasksContainer = document.querySelector("#tasks-container");

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
    alert("Coloca um título na tarefa, animalzinho 🐒");
    return;
  }

  const newTask = {
    id: nextId++,
    title,
    goal,
    urgency,
    progress: 0 
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
    tasksContainer.innerHTML = "<p>Nenhuma tarefa ainda.</p>";
    return;
  }

  tasks.forEach((task) => {
    const card = document.createElement("article");
    card.className = "task-card";

    card.innerHTML = `
      <div class="task-header">
        <span class="task-title">${task.title}</span>
        <span class="task-urgency ${task.urgency}">
          ${getUrgencyLabel(task.urgency)}
        </span>
      </div>

      ${
        task.goal
          ? `<p class="task-goal">Meta de aprendizado: ${task.goal}</p>`
          : ""
      }

      <p class="task-progress">Progresso: ${task.progress}%</p>
    `;

    tasksContainer.appendChild(card);
  });
}
function getUrgencyLabel(urgency) {
  if (urgency === "low") return "Baixa";
  if (urgency === "medium") return "Média";
  if (urgency === "high") return "Alta";
  return "Desconhecida";
}
