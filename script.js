// script.js
const spreadsheetId = "1XsEzpmbQv4cFJjAgfROMPD7TEOy_gn22_IaPje4ZSRw";
const apiKey = "AIzaSyAAahivxgg6dlHcjc26wF326qYg2fXXrqw";
const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/DumbDB!A2:I100?key=${apiKey}`;

let players = [];

// Функция для загрузки игроков
function fetchPlayers() {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      players = data.values
        .filter((row) => row[8]) // Фильтруем строки с заполненным Status
        .map((row, index) => ({
          id: index + 1,
          timestamp: row[0],
          email: row[1],
          nickname: row[2],
          role: row[3],
          situation: row[4],
          minRank: row[5],
          maxRank: row[6],
          replayCode: row[7],
          status: row[8],
        }));
      displayPlayerList();
      checkUrlParams(); // Проверяем URL параметры только после загрузки игроков
    });
}

// Функция для отображения списка игроков
function displayPlayerList() {
  const list = document.getElementById("playerList");
  list.innerHTML = "";
  players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = player.nickname;
    li.onclick = () => displayPlayerDetails(player);
    list.appendChild(li);
  });
}

// Функция для отображения деталей игрока
function displayPlayerDetails(player) {
  const details = document.getElementById("detailsContainer");
  const url = new URL(window.location);
  url.searchParams.set("player", player.nickname);
  url.searchParams.set("id", player.id);
  history.pushState(null, null, url.toString());

  // Определение пути к изображениям
  const rankImagesPath = "images/ranks/";
  const roleImagesPath = "images/roles/";
  const minRankImage = `${rankImagesPath}${player.minRank}.png`;
  const maxRankImage = `${rankImagesPath}${player.maxRank}.png`;
  const roleImage = `${roleImagesPath}${player.role}.png`; // Картинка роли

  details.innerHTML = `
    <div class="nickname-container">
      <span class="nickname">${player.nickname}</span>
      <div class="ranks">
        <img src="${minRankImage}" alt="${player.minRank}" class="rank-icon" title="${player.minRank}">
        <span class="rank-separator">-</span>
        <img src="${maxRankImage}" alt="${player.maxRank}" class="rank-icon" title="${player.maxRank}">
      </div>
    </div>
    <div class="role-container">
      <img src="${roleImage}" alt="${player.role}" class="role-icon" title="${player.role}">
    </div>
    <p><strong>Situation:</strong> ${player.situation}</p>
    <p><strong>Replay Code:</strong> ${player.replayCode}</p>
    <p><strong>Status:</strong> ${player.status}</p>
  `;
}

// Функция для поиска игроков
function searchPlayer() {
  const query = document.getElementById("search").value.toLowerCase();
  const filtered = players.filter((player) =>
    player.nickname.toLowerCase().includes(query)
  );
  const list = document.getElementById("playerList");
  list.innerHTML = "";
  filtered.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = player.nickname;
    li.onclick = () => displayPlayerDetails(player);
    list.appendChild(li);
  });
}

// Функция для проверки URL и загрузки игрока
function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const nickname = params.get("player");
  const id = params.get("id");
  if (nickname && id) {
    const player = players.find(
      (p) => p.nickname === nickname && p.id === parseInt(id)
    );
    if (player) {
      displayPlayerDetails(player);
    }
  }
}

// Инициализация при загрузке страницы
window.onload = () => {
  fetchPlayers();
};