// Guillem Uriel Bagur Moll - 2022
// Chesscraper is under MIT license

String.prototype.replaceAt = function (index, replacement) {
  if (index >= this.length) return this.valueOf();
  return this.substring(0, index) + replacement + this.substring(index + 1);
};

let rows; // Global scope for this array.
let castlings; // Global scope for the castlings information.
const initialPos = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq";

/** Pieces that's not necessary to check them with their movements, because they're have another peculiarity:
 * Queen and King are unique
 * There are two Bishops, but each one always goes through the same square color
 **/
const uniquePieces = ["K", "Q", "B"];

// Checks if the given string is all upper case
const isUpperCase = (string) => {
  return string === string.toUpperCase();
};

/**
 * Checks which player can castle
 */
const checkCastlings = () => {
  const haveToBeRooks = {
    Q: { x: 0, y: 7 },
    K: { x: 7, y: 7 },
    q: { x: 0, y: 0 },
    k: { x: 7, y: 0 },
  };

  for (let rook in haveToBeRooks) {
    const coords = haveToBeRooks[rook];
    const renderRook = isUpperCase(rook) ? "R" : "r";
    if (rows[coords.y][coords.x] != renderRook) {
      const index = castlings.indexOf(rook);
      if (index > -1) {
        castlings.splice(index, 1);
      }
    }
  }

  if (rows[7][4] != "K") castlings.splice(0, 2);
  if (rows[0][4] != "k") castlings.splice(2, 2);
};

/**
 * Find where's the requested piece placed. Theese pieces can be [Q, K, B], the other ones are
 * being found by other ways.
 *
 * @param {string} piece - The piece that we want to find [Q, K, B]
 * @param {integer} squareColor - This param is to find the correct Bishop. If 1, the square will be white. If 0, the square will be black.
 *
 * @returns {object} {x, y} Which are the coordinates of the found piece.
 */
const findPiece = (piece, squareColor) => {
  // This function is useless when we're not searching for one of the unique pieces.
  if (!uniquePieces.includes(piece.toUpperCase())) return;

  // The result this function returns is an object with coordinates x and y.
  let result = {};
  for (let row of rows) {
    // First of all, we search for the row where it's placed the piece.
    if (row.includes(piece)) {
      // Setting the coordinates.
      result["row"] = rows.indexOf(row);
      result["col"] = rows[result.row].indexOf(piece);

      // And, if its not a Bishop, we return those results.
      if (piece != "B") break;

      // We also return the results if the cells are of the same color.
      if (result["row"] + (result["col"] % 2) == squareColor) break;

      // If the found Bishop doesn't stant on a square of the same color
      const bishopsInRow = row.match(/B/g) || [];
      if (bishopsInRow.length > 1) {
        // If there is another Bishop on the same Row, get that one
        result["col"] = rows[result["row"]].lastIndexOf(piece);
        break;
      }
    }
  }

  return result;
};

/**
 * This function checks and executes the moves.
 *
 * @param {string} piece - It's value can be [R, N, B, Q, K] in upper and lower case.
 * @param {integer} col - This is the column where is placed the square we want to place the piece in.
 * @param {integer} row - This is the row where is placed the square we want to place the piece in.
 * @param {integer} color - The color the player who has to move. If 1 is white. If -1 is black.
 * @param {boolean} capturing - Checks if player is capturing or not. This is only rellevant for pawns movements.
 * @param {object} altCoord - Just in case that there are two pieces placed in the same row/col that can execute the same move.
 *
 * @returns {nothing} Only modifies the globar array 'rows'
 */
const executeMoves = (piece, col, row, color, capturing, altCoord) => {
  // color can't be 0
  if (!color) return;
  // This variable is to check later if the requested movement si possible
  let error = false;

  // If it's white turn, the piece will be upper case. If not, it will be lower case.
  // renderPiece contains the piece we will place in the FEN code.
  const renderPiece = color > 0 ? piece.toUpperCase() : piece.toLowerCase();

  // These are the coordinates of the piece we want to move (before the movement).
  let prevRow = null;
  let prevCol = null;

  switch (piece) {
    case "P":
      // Checks if player is capturing or not
      if (capturing) {
        if (rows[col][row] != " " || rows[col][row - 1] != " ") {
          prevCol = col;
          if (rows[row - color][col - 1]) {
            if (rows[row - color][col - 1] == renderPiece) {
              prevRow = row - color;
              prevCol = col - 1;
            }
          }

          if (rows[row - color][col + 1]) {
            if (rows[row - color][col + 1] == renderPiece) {
              prevRow = row - color;
              prevCol = col + 1;
            }
          }
        }

        // Check if capture is 'in passant'
        let enemyPawns = isUpperCase(renderPiece) ? "p" : "P";
        if (rows[row][col] == " " && rows[row - 1][col] == enemyPawns) {
          rows[row - 1] = rows[row - 1].replaceAt(col, " ");
        }

        break;
      }

      // The pawns don't usually change of col, so the previous column will be the same as the new one.
      prevCol = col;
      if (rows[row - color][col] == renderPiece) {
        // If the pawn has moved only one step
        prevRow = row - color;
      } else if (
        rows[row + 2 * -color][col] == renderPiece &&
        (row + 2 * -color == 1 || row + 2 * -color == 6)
      ) {
        // If the pawn has moved two steps.
        // For this movement, we check that the pawn was placed in the 2nd or 7th row respectively.
        prevRow = row + 2 * -color;
      } else {
        // If nothing of above, return.
        error = true;
      }

      break;

    case "R":
      if (rows[row].includes(renderPiece)) {
        /*
        The row that contains the square where we want to move the piece contains a Rook,
        means that we have to pick that Rook (we must add diferentiation).
        */
        prevRow = row;
        prevCol = !altCoord.y ? rows[prevRow].indexOf(renderPiece) : altCoord.y;
      } else {
        // If not, means that the Rook will do a vertical move.
        // Starting on the base that the row doesn't exist.
        let placedRow = -1;
        let detectedRooks = [];
        for (let i = 0; i < rows.length; i++) {
          let analyzingRow = rows[i];
          if (analyzingRow.includes(renderPiece)) {
            // When we find the row containing the Rook.
            placedRow = i;
            detectedRooks.push({ x: col, y: i });
          }
        }

        // If we don't find any row, return error.
        if (placedRow < 0) {
          error = true;
          break;
        }

        let correctCoords =
          detectedRooks.length > 1
            ? detectedRooks.filter(
                (el) => el.y == altCoord.x
              )[0]
            : detectedRooks[0];

        prevRow = correctCoords.y;
        prevCol = correctCoords.x;
      }

      break;

    case "N":
      // Starting on the base that we can't find the requested Knight
      let found = false;

      // All the possible Knight moves
      let knightMoves = [
        { x: -2, y: -1 },
        { x: -2, y: 1 },
        { x: -1, y: -2 },
        { x: -1, y: 2 },
        { x: 1, y: -2 },
        { x: 1, y: 2 },
        { x: 2, y: 1 },
        { x: 2, y: -1 },
      ];

      let detectedKnights = [];
      for (let move of knightMoves) {
        if (rows[row + move.x]) {
          // Checking if that movement is still inside the x axis of the board.
          if (rows[row + move.x][col + move.y]) {
            // Checking if that movement is still inside the y axis of the board.
            if (rows[row + move.x][col + move.y] == renderPiece) {
              // If we find a Knight in the coordinates we're checking, stop.
              detectedKnights.push({ x: row + move.x, y: col + move.y });
            }
          }
        }
      }

      // If we haven't found any Knight in the available coordinates, error.
      if (!detectedKnights.length) error = true;
      let correctCoords;
      if (detectedKnights.length > 1) {
        if (altCoord.x || altCoord.y) {
          correctCoords = detectedKnights.filter(
            (el) => el.x == altCoord.x || el.y == altCoord.y
          )[0];
          if (correctCoords) {
            prevCol = correctCoords.y;
            prevRow = correctCoords.x;
            break;
          }
        }
      }

      prevCol = detectedKnights[0].x;
      prevRow = detectedKnights[0].y;
      break;

    default:
      // If the requested piece isn't any of the possible unique pieces, return error.
      if (!uniquePieces.includes(piece)) {
        error = true;
        break;
      }

      // Get the coordinates of the piece.
      result = findPiece(renderPiece, (col + row) % 2);

      // Set the coordinates.
      prevRow = result["row"];
      prevCol = result["col"];

      break;
  }

  // If an error found during execution, return.
  if (error) return;

  // Else, set the new FEN.
  rows[prevRow] = rows[prevRow].replaceAt(prevCol, " ");
  rows[row] = rows[row].replaceAt(col, renderPiece);
};

/**
 *
 * @param {string} prevPos - The FEN code of the current position.
 * @param {string} move - Following the standard chess format /[RNBQK][a-h][1-8]/
 * @param {integer} color - 1 if it's white's turn. -1 if it's black's turn.
 *
 * @returns {string} The new FEN code.
 */
const getCurrentPosition = (prevPos, move) => {
  const color = (prevPos.split(" ")[1] ?? "w").toLowerCase() == "b" ? -1 : 1;

  const castrings = prevPos.split(" ")[2] ?? "";
  castlings = castrings.match(/[KQ]/gi);

  prevPos = prevPos.split(" ")[0];
  // Represent all the empty squares with a space (" ").
  prevPos = prevPos.replace(/[0-9]/g, (match) => {
    // Convert the match in an integer.
    match = +match;

    // Replace that number for the number of spaces it represents.
    let string = "";
    for (let i = 0; i < match; i++) {
      string += " ";
    }

    return string;
  });

  // Convert the FEN code in an array of rows.
  rows = prevPos.split("/").reverse();

  if ((move.match(/0-0(-0)?/g) ?? []).length < 1) {
    // Convert chess coordinates in array coordinates.
    let moveCol = move.match(/[a-h]/g);
    let altCoords = {};
    if (moveCol.length > 1) {
      altCoords.y = moveCol[0].charCodeAt(0) - 97;
    }

    moveCol = moveCol[moveCol.length - 1]; // We get the last match. Just in case there's a capture.
    // Converting letters into numbers (97 is the ASCII code for letter a lower case)
    const numericCol = moveCol.charCodeAt(0) - 97;

    // Get the piece we want to move.
    let moveRow = move.match(/[1-8]/g);
    if (moveRow.length > 1) {
      altCoords.x = +moveRow[0] - 1;
    }

    moveRow = +moveRow[moveRow.length - 1];
    const [movePiece] = move.match(/[RNBQK]/) ?? "P";

    // Check if the player is capturing
    const capturing = (move.match("x") ?? []).length > 0;

    executeMoves(
      movePiece,
      +numericCol,
      +moveRow - 1,
      color,
      capturing,
      altCoords
    );
  } else {
    const castlingRow = color > 0 ? 0 : 7;
    const renderKing = color > 0 ? "K" : "k";
    const renderRook = color > 0 ? "R" : "r";
    if (move == "0-0") {
      rows[castlingRow] = rows[castlingRow].replaceAt(4, " ");
      rows[castlingRow] = rows[castlingRow].replaceAt(5, renderRook);
      rows[castlingRow] = rows[castlingRow].replaceAt(6, renderKing);
      rows[castlingRow] = rows[castlingRow].replaceAt(7, " ");
    } else if (move == "0-0-0") {
      rows[castlingRow] = rows[castlingRow].replaceAt(4, " ");
      rows[castlingRow] = rows[castlingRow].replaceAt(2, renderKing);
      rows[castlingRow] = rows[castlingRow].replaceAt(3, renderRook);
      rows[castlingRow] = rows[castlingRow].replaceAt(0, " ");
    }
  }

  /* Parse the modified FEN to a standard FEN code. */
  // Visually, black pieces come first, in a FEN code.
  rows = rows.reverse();
  let result = rows.join("/");

  // Replace the spaces (" ") for the number of spaces that we can find consecutively.
  result = result.replace(/ +/g, (match) => {
    return match.length;
  });

  checkCastlings();

  // It's upside because it represents the next move.
  const stringColor = color > 0 ? "b" : "w";
  return `${result} ${stringColor} ${castlings.join("")}`;
};

document.addEventListener("DOMContentLoaded", () =>
  console.log(getCurrentPosition(initialPos, "N3e4"))
);
