// Пример ваших актуальных настроек
const spreadsheetId = "1XsEzpmbQv4cFJjAgfROMPD7TEOy_gn22_IaPje4ZSRw";
const apiKey = "AIzaSyAAahivxgg6dlHcjc26wF326qYg2fXXrqw";
const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/DumbDB!A2:I1000?key=${apiKey}`;

let players = [];
let currentPage = 1;
const pageSize = 8;
const maxVisibleButtons = 5;

// Загрузка игроков
function fetchPlayers() {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      players = data.values
        .filter((row) => row[8]) // row[8] — статус
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
      displayPagination();
      checkUrlParams();
    })
    .catch((error) => {
      console.error("Ошибка загрузки данных:", error);
    });
}

// Список игроков
function displayPlayerList() {
  const list = document.getElementById("playerList");
  list.innerHTML = "";

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const playersToDisplay = players.slice(start, end);

  playersToDisplay.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = player.nickname;
    li.onclick = () => displayPlayerDetails(player);
    list.appendChild(li);
  });
}

// Пагинация
function displayPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(players.length / pageSize);

  let startPage = Math.max(currentPage - Math.floor(maxVisibleButtons / 2), 1);
  let endPage = Math.min(startPage + maxVisibleButtons - 1, totalPages);

  if (endPage - startPage + 1 < maxVisibleButtons) {
    startPage = Math.max(endPage - maxVisibleButtons + 1, 1);
  }

  if (startPage > 1) {
    const firstButton = createPaginationButton(1, "1");
    pagination.appendChild(firstButton);
    if (startPage > 2) {
      pagination.appendChild(createPaginationDots());
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const button = createPaginationButton(i, i.toString());
    pagination.appendChild(button);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pagination.appendChild(createPaginationDots());
    }
    const lastButton = createPaginationButton(totalPages, totalPages.toString());
    pagination.appendChild(lastButton);
  }
}

function createPaginationButton(page, text) {
  const button = document.createElement("button");
  button.textContent = text;
  button.className = page === currentPage ? "active" : "";
  button.onclick = () => {
    currentPage = page;
    displayPlayerList();
    displayPagination();
  };
  return button;
}

function createPaginationDots() {
  const dots = document.createElement("span");
  dots.textContent = "...";
  dots.className = "pagination-dots";
  return dots;
}

// Детали игрока
function displayPlayerDetails(player) {
  const details = document.getElementById("detailsContainer");

  // Обновляем URL с параметрами
  const newUrl = new URL(window.location);
  newUrl.searchParams.set("player", player.nickname);
  newUrl.searchParams.set("id", player.id);
  history.pushState(null, null, newUrl.toString());

  // Пути к изображениям
  const rankImagesPath = "images/ranks/";
  const roleImagesPath = "images/roles/";
  const minRankImage = `${rankImagesPath}${player.minRank}.png`;
  const maxRankImage = `${rankImagesPath}${player.maxRank}.png`;
  const roleImage = `${roleImagesPath}${player.role}.png`;

  // Проверяем наличие YouTube-ссылки
  const youtubeRegex = /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)|https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/;
  const match = player.status?.match(youtubeRegex);
  const cleanStatus = player.status?.replace(youtubeRegex, "").replace(/\?.*/, "").trim();

  let youtubeEmbed = "";
  if (match) {
    const youtubeVideoId = match[1] || match[2];
    youtubeEmbed = `
      <div class="youtube-container">
        <iframe
          src="https://www.youtube.com/embed/${youtubeVideoId}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    `;
  }

  // Ранги
  let ranksHtml = "";
  if (player.minRank === player.maxRank) {
    ranksHtml = `
      <img src="${minRankImage}" alt="${player.minRank}" class="rank-icon" title="${player.minRank}">
    `;
  } else {
    ranksHtml = `
      <img src="${minRankImage}" alt="${player.minRank}" class="rank-icon" title="${player.minRank}">
      <span class="rank-separator">-</span>
      <img src="${maxRankImage}" alt="${player.maxRank}" class="rank-icon" title="${player.maxRank}">
    `;
  }

  // Формируем контент карточки
  details.innerHTML = `
    <div class="nickname-container">
      <span class="nickname">${player.nickname}</span>
      <div class="ranks">
        ${ranksHtml}
      </div>
    </div>
    <div class="role-container">
      <img src="${roleImage}" alt="${player.role}" class="role-icon" title="${player.role}">
    </div>
    <p><strong>Situation:</strong> ${player.situation}</p>
    <p><strong>Status:</strong> ${cleanStatus}</p>
    ${youtubeEmbed}
  `;
}

// Поиск
function searchPlayer() {
  const query = document.getElementById("search").value.toLowerCase();
  const list = document.getElementById("playerList");
  const pagination = document.getElementById("pagination");

  if (query.length > 0) {
    pagination.style.display = "none";
    const filteredPlayers = players.filter((player) =>
      player.nickname.toLowerCase().includes(query)
    );

    list.innerHTML = "";
    if (filteredPlayers.length === 0) {
      list.innerHTML = `<li style="text-align:center;">No players found</li>`;
    } else {
      filteredPlayers.forEach((player) => {
        const li = document.createElement("li");
        li.textContent = player.nickname;
        li.onclick = () => displayPlayerDetails(player);
        list.appendChild(li);
      });
    }
  } else {
    pagination.style.display = "flex";
    displayPlayerList();
    displayPagination();
  }
}

// Проверка URL (при перезагрузке)
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

// Инициализация
window.onload = () => {
  fetchPlayers();
};
