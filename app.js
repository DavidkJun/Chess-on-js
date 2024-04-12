const gameBoard = document.querySelector("#gameboard");
const playerDetails = document.querySelector("#player");
const infoDisplay = document.querySelector("#info-display");
const err = document.querySelector("#err");
const FIELD_SIZE = 8 // FIELD_SIZE
const FULL_FIELD = 63;

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
    const colors = ["light-brown", "dark-brown"];
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement("div");
        square.classList.add("square");
        square.innerHTML = startPiece;
        square.setAttribute("square-id", i);
        square.firstChild?.setAttribute('draggable', true);


        const colorIndex = (i + Math.floor((FULL_FIELD - i) / FIELD_SIZE) + 1) % 2;
        square.classList.add(colors[colorIndex]);


        if (i <= 15 || i >= 48) {
            const colorClass = i <= 15 ? "black" : "white";
            square.firstChild.firstChild.classList.add(colorClass);
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
    //зробити булеан змінну, і на основі її зміни міняти колір
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
    const piece = draggedElement.id;

    const isRightCrossForwardClear = [];
    const isLeftCrossForwardClear = [];
    const isRightCrossBackwardClear = [];
    const isLeftCrossBackwardClear = [];
    const isStraightForwardClear = [];
    const isStraightBackwardClear = [];
    const isStraightRightClear = [];
    const isStraightLeftClear = [];

    for (let i = 1; i <= 7; i++) {
        isRightCrossForwardClear[i] = isRightCrossForwardClear[i-1] !== false && !document.querySelector(`[square-id="${startId + FIELD_SIZE * i + i}"]`)?.firstChild;
        isLeftCrossForwardClear[i] = isLeftCrossForwardClear[i-1] !== false && !document.querySelector(`[square-id="${startId + FIELD_SIZE * i - i}"]`)?.firstChild;
        isRightCrossBackwardClear[i] = isRightCrossBackwardClear[i-1] !== false && !document.querySelector(`[square-id="${startId - FIELD_SIZE * i - i}"]`)?.firstChild;
        isLeftCrossBackwardClear[i] = isLeftCrossBackwardClear[i-1] !== false && !document.querySelector(`[square-id="${startId - FIELD_SIZE * i + i}"]`)?.firstChild;
        isStraightForwardClear[i] = isStraightForwardClear[i-1] !== false && !document.querySelector(`[square-id="${startId + FIELD_SIZE * i}"]`)?.firstChild;
        isStraightBackwardClear[i] = isStraightBackwardClear[i-1] !== false && !document.querySelector(`[square-id="${startId - FIELD_SIZE * i}"]`)?.firstChild;
        isStraightRightClear[i] = isStraightRightClear[i-1] !== false && !document.querySelector(`[square-id="${startId + i}"]`)?.firstChild;
        isStraightLeftClear[i] = isStraightLeftClear[i-1] !== false && !document.querySelector(`[square-id="${startId - i}"]`)?.firstChild;
    }

    switch (piece) {
        case 'pawn':

            const starterRow = [8,9,10,11,12,13,14,15];
            if(starterRow.includes(startId) && startId + FIELD_SIZE * 2 === targetId && isStraightForwardClear[2] ||
                startId + FIELD_SIZE === targetId ||
                startId + FIELD_SIZE - 1 === targetId && document.querySelector(`[square-id="${startId + FIELD_SIZE - 1}"]`).firstChild ||
                startId + FIELD_SIZE + 1 === targetId && document.querySelector(`[square-id="${startId + FIELD_SIZE + 1}"]`).firstChild){
                return true;
            }
            break;
        case 'knight':

            if(
                startId + FIELD_SIZE * 2 + 1 === targetId ||
                startId + FIELD_SIZE * 2 - 1 === targetId ||
                startId + FIELD_SIZE - 2 === targetId ||
                startId + FIELD_SIZE + 2 === targetId ||
                startId - FIELD_SIZE * 2 + 1 === targetId ||
                startId - FIELD_SIZE * 2 - 1 === targetId ||
                startId - FIELD_SIZE + 2 === targetId ||
                startId - FIELD_SIZE - 2 === targetId
            ){
                return true;
            }
            break;
        case 'bishop':

            for (let i = 1; i <= 7; i++) {
                if (
                    (targetId === startId + FIELD_SIZE * i + i && isRightCrossForwardClear[i]) ||
                    (targetId === startId + FIELD_SIZE * i - i && isLeftCrossForwardClear[i]) ||
                    (targetId === startId - FIELD_SIZE * i - i && isRightCrossBackwardClear[i]) ||
                    (targetId === startId - FIELD_SIZE * i + i && isLeftCrossBackwardClear[i])
                ) {
                    return true;
                }
            }
            break;
        case 'queen':

            for (let i = 1; i <= 7; i++) {
                if (
                    (targetId === startId + FIELD_SIZE * i + i && isRightCrossForwardClear[i]) ||
                    (targetId === startId + FIELD_SIZE * i - i && isLeftCrossForwardClear[i]) ||
                    (targetId === startId - FIELD_SIZE * i - i && isRightCrossBackwardClear[i]) ||
                    (targetId === startId - FIELD_SIZE * i + i && isLeftCrossBackwardClear[i]) ||
                    (targetId === startId + FIELD_SIZE * i && isStraightForwardClear[i]) ||
                    (targetId === startId - FIELD_SIZE * i && isStraightBackwardClear[i]) ||
                    (targetId === startId + i && isStraightRightClear[i]) ||
                    (targetId === startId - i && isStraightLeftClear[i])
                ) {
                    return true;
                }
            }
            break;
        case 'rook':

            for (let i = 1; i <= 7; i++) {
                if (
                    (targetId === startId + FIELD_SIZE * i && isStraightForwardClear[i]) ||
                     (targetId === startId - FIELD_SIZE * i && isStraightBackwardClear[i]) ||
                    (targetId === startId + i && isStraightRightClear[i]) ||
                    (targetId === startId - i && isStraightLeftClear[i])
                ) {
                    return true;
                }
            }
            break;
        case 'king':
            if (
                startId + 1 === targetId ||
                startId - 1 === targetId ||
                startId + FIELD_SIZE === targetId ||
                startId + FIELD_SIZE + 1 === targetId ||
                startId + FIELD_SIZE - 1 === targetId ||
                startId - FIELD_SIZE === targetId ||
                startId - FIELD_SIZE + 1 === targetId ||
                startId - FIELD_SIZE - 1 === targetId
            ) {
                return true;
            }
            break;
        default:
            break;
    }
}
// зробити через інверсію змінної, та брати змінну з масиву
function changePlayer(){
    if(playerTurn === 'black'){
        reverseIds()
        playerTurn = 'white'
        playerDetails.textContent = 'white'
    } else {
        revertIds()
        playerTurn = 'black'
        playerDetails.textContent = 'black'
    }
}
// замінити forEach на for of
function reverseIds() {
    const allSquares = document.querySelectorAll('#gameboard .square');
    let index = 0;
    for (const square of allSquares) {
        square.setAttribute('square-id', (FIELD_SIZE * FIELD_SIZE - 1) - index);
        index++;
    }
}
// покращити назви змінних
function revertIds() {
    const allSquares = document.querySelectorAll('#gameboard .square');
    allSquares.forEach((square, i) => {
        square.setAttribute('square-id', i)
    })
}
// об'єднати блоки, та порівнювати параметри white через тру та false
function checkForWin() {
    const kings = Array.from(document.querySelectorAll('#king'));

    if (!kings.some(king => king.firstChild.classList.contains('white'))) {
        infoDisplay.innerHTML = "Black Player Wins!";
        const allSquares = document.querySelectorAll('.square');
        allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false));
    }
    if (!kings.some(king => king.firstChild.classList.contains('black'))) {
        infoDisplay.innerHTML = "White Player Wins!";
        const allSquares = document.querySelectorAll('.square');
        allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false));
    }
}
