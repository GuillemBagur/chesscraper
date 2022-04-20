

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
    let bothMoves = "";
    for (let m of move) {
      if(m == '1-0' || m == '0-1' || m == '1/2-1/2') return;
      const individualMove = 2*game.indexOf(move) + move.indexOf(m);
      console.log(individualMove);
      bothMoves += `<span class="move" data-index="${individualMove}" data-position="${fenGame[individualMove]}">${m}</span>`;
    }

    notation.innerHTML += `<li>${bothMoves}</li>`;
  }

  notation.innerHTML += "</ul>";
};

document.getElementById('next-move').addEventListener('click', () =>{
  move ++;
  // -2 because: -1 because we're using move as array index. The other one is to avoid the result (sometimes, it gets the result as a movement).
  if(move > chosenGame.length-2) return;
  if(chosenGame[move] == '1-0' || chosenGame[move] == '0-1' || chosenGame[move] == '1/2-1/2') return;
  board.position(chosenGame[move]);
});