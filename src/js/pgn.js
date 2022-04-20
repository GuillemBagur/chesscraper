const convertToFEN = (game) => {
  let fenMoves = [];
  let lastPos = initialPos;
  for (let move of game.moves) {
    for (let m of move) {
      let resultFen = getCurrentPosition(lastPos, m);
      if (!resultFen) return 0;
      fenMoves.push(resultFen);
      lastPos = resultFen;
    }
  }

  return fenMoves;
};

const getResultsInPosition = (games, position, untilDate) => {
  let results = {
    foundGames: 0,
    wonGames: 0,
    lostGames: 0,
  };

  for (let game of games) {
    const FENMoves = convertToFEN(game);
    if (!FENMoves) continue;
    if (FENMoves.includes(position)) {
      results.foundGames++;
      if (game.meta.includes("1-0")) {
        if (
          game.meta
            .toLowerCase()
            .includes(`[white "${playerName}"]`.toLowerCase())
        ) {
          results.wonGames++;
        } else {
          results.lostGames++;
        }
      }

      if (game.meta.includes("0-1")) {
        if (
          game.meta
            .toLowerCase()
            .includes(`[black "${playerName}"]`.toLowerCase())
        ) {
          results.wonGames++;
        } else {
          results.lostGames++;
        }
      }
    }
  }

  console.log(results);
};

const getWinningPer = (games, untilDate) => {
  console.log(games);
  const colors = ["white", "black"];
  let sortedGames = {};
  for (let color of colors) {
    sortedGames[color] = games.filter((game) => {
      if (game.meta.toLowerCase().split(`[${color} "${playerName}"]`)[1]) {
        return game;
      }
    });
  }

  let wonGames = {
    total: 0,
    white: 0,
    black: 0,
    totalLowerElo: 0,
    higherEloWithWhite: 0,
    higherEloWithBlack: 0,
  };

  sortedGames["white"].forEach((game) => {
    let whiteElo = game.meta.split("WhiteElo")[1]
      ? game.meta.split("WhiteElo")[1].split('"')[1]
      : 0;
    let blackElo = game.meta.split("BlackElo")[1]
      ? game.meta.split("BlackElo")[1].split('"')[1]
      : 0;

    if (whiteElo < blackElo) {
      wonGames.totalLowerElo++;
    }

    if (game.moves[game.moves.length - 1].includes("1-0")) {
      wonGames.total++;
      wonGames.white++;

      if (whiteElo < blackElo) {
        wonGames.higherEloWithWhite++;
      }
    }
  });

  sortedGames["black"].forEach((game) => {
    let whiteElo = game.meta.split("WhiteElo")[1]
      ? game.meta.split("WhiteElo")[1].split('"')[1]
      : 0;
    let blackElo = game.meta.split("BlackElo")[1]
      ? game.meta.split("BlackElo")[1].split('"')[1]
      : 0;

    if (whiteElo > blackElo) {
      wonGames.totalLowerElo++;
    }

    if (game.moves[game.moves.length - 1].includes("0-1")) {
      wonGames.total++;
      wonGames.black++;

      if (whiteElo > blackElo) {
        wonGames.higherEloWithBlack++;
      }
    }
  });

  return wonGames;
};

const getDynamicData = (games) => {
  getWinningPer(games, 0);
  getResultsInPosition(
    games,
    `rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq`
  );
};

/**
 * Extracts the information inside the imported PGN.
 *
 * @param {object} file The file to scrape the games from.
 * @returns {nothing} But inserts games and info into the global object PlayerInfo
 */
const importGames = (file) => {
  // It only works with PGN files.
  if (file.type.toLowerCase() != "application/vnd.chess-pgn") return;
  // The player name to scrape the static data (from fide.com and yottachess.com).
  playerName = file.name.split(".")[0];

  // Inits the file reader.
  const reader = new FileReader();
  reader.onload = (event) => {
    // Converts the content in a games array.
    const content = event.target.result.split(/\n\n/gi);
    let games = [];
    for (let i = 0; i < content.length; i += 2) {
      let movesData = content[i + 1];
      if (!movesData) continue;
      // Splits the whole game notation in a moves array.
      movesData = movesData.split(/ ?\d*\. /g).filter((el) => el != "");
      movesData = movesData.map((el) => el.split(" "));
      games.push({ meta: content[i], moves: movesData });
    }

    playerInfo.games = games;

    // Scrape the static stats from fide.com
    scrape(playerName);

    /* POVISIONAL */
    // If the info fits in localStorage, set it.
    if (JSON.stringify(playerInfo).length < 5 * 1000 * 1000) {
      localStorage.setItem("chesscraper-cache", JSON.stringify(playerInfo));
    }

    updateGamesList(games);
    chosenGame = convertToFEN(games[0]);
    updateNotation(games[0].moves, convertToFEN(games[0]));
    getDynamicData(games);
  };

  reader.onerror = (error) => reject(error);
  reader.readAsText(file);
};

document.addEventListener("DOMContentLoaded", () => {
  const uploadPgn = document.getElementById("upload-pgn");
  uploadPgn.addEventListener("change", () => importGames(uploadPgn.files[0]));
});
