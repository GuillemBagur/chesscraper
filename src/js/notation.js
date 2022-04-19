const updateGamesList = (games) => {
  gamesList.innerHTML = "<ul>";
  for (let game of games) {
    gamesList.innerHTML += `<li data-gameid="${games.indexOf(game)}">Partida</li>`;
  }

  gamesList.innerHTML += "</ul>";
};

const updateNotation = (game, fenGame) => {
  notation.innerHTML = "<ul>";
  for (let move of game) {
    for (let m of move) {
      const individualMove = game.indexOf(move) + move.indexOf(m);
      notation.innerHTML += `<li data-position="${fenGame[individualMove]}">${m}</li>`;
    }
  }

  notation.innerHTML += "</ul>";
};
