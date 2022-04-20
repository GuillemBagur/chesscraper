// Here, we'll initialize all global variables

let playerInfo = {};
let playerName;
const initialPos = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq";
const gamesList = document.getElementById('games-list');
const notation = document.getElementById('notation');
let move = 0;
let chosenGame;
var board = Chessboard("board", config);


document.addEventListener('DOMContentLoaded', () =>{
    gamesList.addEventListener('click', e =>{
        if(!e.target == 'LI') return;
        const game = e.target.dataset.gameid;
        console.log(game);
        updateNotation(playerInfo.games[game].moves, convertToFEN(playerInfo.games[game]));
        board.position(initialPos);
        chosenGame = convertToFEN(playerInfo.games[game]);
        move = 0;
    });

    notation.addEventListener('click', e =>{
        if(!e.target == 'SPAN') return;
        const pos = e.target.dataset.position;
        console.log(pos);
        board.position(pos);
        console.log(e.target.dataset.index)
        move = e.target.dataset.index;
    });
});