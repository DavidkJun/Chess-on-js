const gameBoard = document.querySelector("#gameboard");
const playerDetails = document.querySelector("#player");
const infoDisplay = document.querySelector("#info-display");
const err = document.querySelector("#err");
const width = 8

let playerTurn = 'black';
playerDetails.textContent = 'black'

const startPieces = [
    Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook,
    Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn,
    Rook, Knight, Bishop, King, Queen, Bishop, Knight, Rook,
]

function createBoard() {
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement("div");
        square.classList.add("square");
        square.innerHTML = startPiece

        square.setAttribute("square-id", i);
        square.firstChild?.setAttribute('draggable', true)

        const row = Math.floor((63 - i) / 8) + 1;

        if (row % 2 === 0) {
            square.classList.add(i % 2 == 0 ? "light-brown" : "dark-brown");
        } else {
            square.classList.add(i % 2 == 0 ? "dark-brown" : "light-brown");
        }

        if (i <= 15) {
            square.firstChild.firstChild.classList.add("black");
        }
        if (i >= 48) {
            square.firstChild.firstChild.classList.add("white");
        }


        gameBoard.append(square);
    });
};

createBoard();

const allSquares = document.querySelectorAll("#gameboard .square");

allSquares.forEach(square => {
    square.addEventListener('dragstart', dragstart);
    square.addEventListener('dragover', dragover);
    square.addEventListener('drop', dragdrop);
})

let startPositionId;
let draggedElement;

function dragstart(e){
    startPositionId = e.target.parentNode.getAttribute("square-id");
    draggedElement = e.target;
}

function dragover(e){
    e.preventDefault();
}

function dragdrop(e) {
    e.stopPropagation();

    const correctTurn = draggedElement.firstChild.classList.contains(playerTurn);
    const taken = e.target.classList.contains('piece');
    const valid = checkIfValid(e.target);
    const opponentTurn = playerTurn === 'white' ? 'black' : 'white';
    const takenByOpponent = e.target.firstChild?.classList.contains(opponentTurn);

    if (correctTurn) {
        if (takenByOpponent && valid) {
            e.target.parentNode.append(draggedElement);
            e.target.remove();
            checkForWin();
            changePlayer();
            return
        }
        if (taken && !takenByOpponent) {
            err.textContent = 'Can not go there'
            setTimeout(() => {
                err.textContent = ''
            }, 2000);
            return
        }
        if (valid) {
            e.target.append(draggedElement);
            checkForWin();
            changePlayer();
            return
        }
    }
}

function checkIfValid(target) {
    const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'));
    const startId = Number(startPositionId);
    const piece = draggedElement.id
    console.log(startId, targetId, piece);

    switch (piece){
        case 'pawn':
            const starterRow = [8,9,10,11,12,13,14,15];
            if(starterRow.includes(startId) && startId + width * 2 === targetId ||
                startId + width === targetId ||
                startId + width - 1 === targetId && document.querySelector(`[square-id = "${startId + width - 1}"]`).firstChild ||
                startId + width + 1 === targetId && document.querySelector(`[square-id = "${startId + width + 1}"]`).firstChild){
                return true;
            }
            break;
        case 'knight':
            if(
                startId + width * 2 + 1 === targetId ||
                startId + width * 2 - 1 === targetId ||
                startId + width - 2 === targetId ||
                startId + width + 2 === targetId ||
                startId- width * 2 + 1 === targetId ||
                startId - width * 2 - 1 === targetId ||
                startId - width + 2 === targetId ||
                startId - width - 2 === targetId
            ){
                return true
            }
            break;

        case 'bishop':
            if(
                //moving right cross - forward
                startId + width + 1 === targetId ||
                startId + width * 2 + 2 === targetId && !document.querySelector(`[square-id = "${startId + width + 1}"]`).firstChild ||
                startId + width * 3 + 3 === targetId && !document.querySelector(`[square-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 2 + 2}"]`).firstChild ||
                startId + width * 4 + 4 === targetId && !document.querySelector(`[square-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 3 + 3}"]`).firstChild ||
                startId + width * 5 + 5 === targetId && !document.querySelector(`[square-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 4 + 4}"]`).firstChild ||
                startId + width * 6 + 6 === targetId && !document.querySelector(`[square-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 5 + 5}"]`).firstChild ||
                startId + width * 7 + 7 === targetId && !document.querySelector(`[square-id = "${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 5 + 5}"]`).firstChild && !document.querySelector(`[square-id = "${startId + width * 6 + 6}"]`).firstChild
            ) {
                return true;
            }
            break
    }
}
