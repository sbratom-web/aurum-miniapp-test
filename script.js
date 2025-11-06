const form = document.getElementById("buyForm");
const tableBody = document.querySelector("#table tbody");
const message = document.getElementById("message");
const drawBtn = document.getElementById("draw");
const winnerDiv = document.getElementById("winner");

let users = [];

form.addEventListener("submit", e => {
  e.preventDefault();
  const address = document.getElementById("address").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);

  if (!address || isNaN(amount) || amount <= 0) {
    message.innerText = "⚠️ Проверь правильность данных.";
    return;
  }

  const tickets = Math.floor(amount / 100);
  users.push({ address, amount, tickets });

  updateTable();
  message.innerText = `✅ Добавлено: ${tickets} билетов.`;
  form.reset();
});

function updateTable() {
  tableBody.innerHTML = "";
  users.forEach(u => {
    const row = `<tr><td>${u.address}</td><td>${u.amount}</td><td>${u.tickets}</td></tr>`;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}

drawBtn.addEventListener("click", () => {
  if (users.length === 0) {
    winnerDiv.innerText = "❌ Нет участников.";
    return;
  }

  const pool = users.flatMap(u => Array(u.tickets).fill(u.address));
  if (pool.length === 0) {
    winnerDiv.innerText = "❌ Ни у кого нет билетов.";
    return;
  }

  const winner = pool[Math.floor(Math.random() * pool.length)];
  winnerDiv.innerHTML = `🏆 Победитель: <b>${winner}</b>`;
});
