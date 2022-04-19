// Here, we'll initialize all global variables

let playerInfo = {};
let playerName;
const initialPos = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq";
const gamesList = document.getElementById('games-list');
const notation = document.getElementById('notation');
var board = Chessboard("board", config);


document.addEventListener('DOMContentLoaded', () =>{
    gamesList.addEventListener('click', e =>{
        if(!e.target == 'LI') return;
        const game = e.target.dataset.gameid;
        console.log(game);
        updateNotation(playerInfo.games[game].moves, convertToFEN(playerInfo.games[game]));
    });

    notation.addEventListener('click', e =>{
        if(!e.target == 'LI') return;
        const pos = e.target.dataset.position;
        console.log(pos);
        board.position(pos);
    });
});