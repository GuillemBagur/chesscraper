const convertToFEN = (game) => {
  console.log(game);
  let fenMoves = [];
  let lastPos = initialPos;
  for (let move of game.moves) {
    for (let m of move) {
      let resultFen = getCurrentPosition(lastPos, m);
      fenMoves.push(resultFen);
      lastPos = resultFen;
      board.position(resultFen);
    }
  }

  return fenMoves;
};

/*
let move = 0;
const FENMoves = convertToFEN({
  meta: '[Event "U14 Spanish Championship"]\n[Site "?"]\n[Date "2019.07.12"]\n[Round "7.30"]\n[White "Bagur Moll, Guillem Uriel"]\n[Black "Tabuenca Mendataurigoitia, Dani"]\n[Result "0-1"]\n[Annotator "YottaBase"]\n[BlackClock "0:03:24"]\n[BlackElo "1765"]\n[BlackTeam "España"]\n[BlackTeamCountry "ESP"]\n[EventDate "2019.??.??"]\n[PlyCount "160"]\n[Source "YottaBase"]\n[SourceDate "2019.11.11"]\n[SourceTitle "YottaBase"]\n[WhiteClock "0:34:37"]\n[WhiteElo "1531"]\n[WhiteTeam "España"]\n[WhiteTeamCountry "ESP"]',
  moves: [
    ["d4", "Nf6"],
    ["c4", "c5"],
    ["d5", "b5"],
    ["cxb5", "a6"],
    ["b6", "d6"],
    ["e4", "Nbd7"],
    ["Nc3", "g6"],
    ["a4", "Qxb6"],
    ["f4", "Bg7"],
    ["Nf3", "O-O"],
    ["Nd2", "Qc7"],
    ["Bd3", "e6"],
    ["dxe6", "fxe6"],
    ["Bc4", "Re8"],
    ["O-O", "Kh8"],
    ["Nf3", "Nb6"],
    ["Ba2", "Bb7"],
    ["Ng5", "c4"],
    ["Qe2", "d5"],
    ["e5", "Ng8"],
    ["Qg4", "Qe7"],
    ["Bb1", "Bh6"],
    ["Ne2", "Bxg5"],
    ["fxg5", "Rf8"],
    ["Nd4", "Rxf1+"],
    ["Kxf1", "Rf8+"],
    ["Kg1", "Qf7"],
    ["Qf3", "Nd7"],
    ["Qxf7", "Rxf7"],
    ["Nxe6", "Nxe5"],
    ["Nd8", "Rd7"],
    ["Nxb7", "Rxb7"],
    ["Ra3", "Ne7"],
    ["Re3", "N7c6"],
    ["Bc2", "d4"],
    ["Re4", "d3"],
    ["Bd1", "Kg7"],
    ["Bf4", "Rxb2"],
    ["Rxe5", "c3"],
    ["Rc5", "c2"],
    ["Bxc2", "Rxc2"],
    ["Rd5", "Nb4"],
    ["Rd7+", "Kg8"],
    ["Rd4", "a5"],
    ["g4", "Ra2"],
    ["h4", "Rxa4"],
    ["Bd2", "Ra1+"],
    ["Kf2", "Ra2"],
    ["Rd8+", "Kf7"],
    ["Ke3", "Ke6"],
    ["Bxb4", "axb4"],
    ["Kxd3", "Ra3+"],
    ["Kc4", "Rg3"],
    ["Kxb4", "Rxg4+"],
    ["Kc3", "Rxh4"],
    ["Ra8", "Kf5"],
    ["Ra5+", "Kg4"],
    ["Kd3", "Rh5"],
    ["Ra7", "Kxg5"],
    ["Ke3", "Kg4"],
    ["Ra4+", "Kg3"],
    ["Ke2", "Re5+"],
    ["Kf1", "h5"],
    ["Ra3+", "Kf4"],
    ["Kg2", "h4"],
    ["Ra4+", "Re4"],
    ["Ra3", "g5"],
    ["Rf3+", "Kg4"],
    ["Rf2", "h3+"],
    ["Kh2", "Kh4"],
    ["Rf8", "Re2+"],
    ["Kh1", "g4"],
    ["Rf1", "Kg3"],
    ["Kg1", "h2+"],
    ["Kh1", "Re3"],
    ["Ra1", "Kf2"],
    ["Ra2+", "Re2"],
    ["Ra1", "Re1+"],
    ["Rxe1", "Kxe1"],
    ["Kg2", "h1=Q+", "0-1"],
  ],
});
const nextMove = () => {
  move ++;
  board.position(FENMoves[move]);
};

document.getElementById("next-move").addEventListener("click", nextMove);
*/
const getResultsInPosition = (games, position, untilDate) => {
  let results = {
    foundGames: 0,
    wonGames: 0,
    lostGames: 0,
  };

  for (let game of games) {
    //console.log(JSON.stringify(game));
    const FENMoves = convertToFEN(game);
    //console.log(FENMoves, position);
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

    getDynamicData(games);
  };

  reader.onerror = (error) => reject(error);
  reader.readAsText(file);
};

document.addEventListener("DOMContentLoaded", () => {
  const uploadPgn = document.getElementById("upload-pgn");
  uploadPgn.addEventListener("change", () => importGames(uploadPgn.files[0]));
});
