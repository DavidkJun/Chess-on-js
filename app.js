const gameBoard = document.querySelector("#gameboard");
const playerDetails = document.querySelector("#player");
const infoDisplay = document.querySelector("#info-display");
const err = document.querySelector("#err");

const FIELD_SIZE = 8
const FULL_FIELD = 63;
const timeDellay = 2000;
const blackStartPeices = 15;
const whiteStartPeices = 48;

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
    for (const [i, startPiece] of startPieces.entries()) {
        const square = document.createElement("div");
        square.classList.add("square");
        square.innerHTML = startPiece;
        square.setAttribute("square-id", i);
        square.firstChild?.setAttribute('draggable', true);

        const colorIndex = (i + Math.floor((FULL_FIELD - i) / FIELD_SIZE) + 1) % 2;
        square.classList.add(colors[colorIndex]);

        if (i <= blackStartPeices || i >= whiteStartPeices) {
            const colorClass = i <= blackStartPeices ? "black" : "white";
            square.firstChild.firstChild.classList.add(colorClass);
        }

        gameBoard.append(square);
    }
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

function dragstart(e) {
    startPositionId = e.target.parentNode.getAttribute("square-id");
    draggedElement = e.target;
}

function dragover(e) {
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
            return;
        }
        if (taken && !takenByOpponent) {
            err.textContent = 'Can not go there'
            setTimeout(() => {
                err.textContent = ''
            }, timeDellay);
            return;
        }
        if (valid) {
            e.target.append(draggedElement);
            checkForWin();
            changePlayer();
            return;
        }
    }
}

function checkPawn(targetId, startId,moves) {
    const starterRow = [8, 9, 10, 11, 12, 13, 14, 15];
    if (starterRow.includes(startId) && startId + FIELD_SIZE * 2 === targetId && moves['isStraightForwardClear'][2] ||
        startId + FIELD_SIZE === targetId ||
        startId + FIELD_SIZE - 1 === targetId && document.querySelector(`[square-id="${startId + FIELD_SIZE - 1}"]`).firstChild ||
        startId + FIELD_SIZE + 1 === targetId && document.querySelector(`[square-id="${startId + FIELD_SIZE + 1}"]`).firstChild) {
        return true;
    }
    return false;
}


function checkKnight(targetId, startId){
    if (
        startId + FIELD_SIZE * 2 + 1 === targetId ||
        startId + FIELD_SIZE * 2 - 1 === targetId ||
        startId + FIELD_SIZE - 2 === targetId ||
        startId + FIELD_SIZE + 2 === targetId ||
        startId - FIELD_SIZE * 2 + 1 === targetId ||
        startId - FIELD_SIZE * 2 - 1 === targetId ||
        startId - FIELD_SIZE + 2 === targetId ||
        startId - FIELD_SIZE - 2 === targetId
    ) {
        return true;
    }
    return false;
}

function checkBishop(targetId, startId, moves){
    for (let i = 1; i <= 7; i++) {
        if (
            (targetId === startId + FIELD_SIZE * i + i && moves['isRightCrossForwardClear'][i]) ||
            (targetId === startId + FIELD_SIZE * i - i && moves['isLeftCrossForwardClear'][i]) ||
            (targetId === startId - FIELD_SIZE * i - i && moves['isRightCrossBackwardClear'][i]) ||
            (targetId === startId - FIELD_SIZE * i + i && moves['isLeftCrossBackwardClear'][i])
        ) {
            return true;
        }
    }
    return false;
}

function checkQueen(targetId, startId, moves) {
    for (let i = 1; i <= 7; i++) {
        if (
            (targetId === startId + FIELD_SIZE * i + i && moves['isRightCrossForwardClear'][i]) ||
            (targetId === startId + FIELD_SIZE * i - i && moves['isLeftCrossForwardClear'][i]) ||
            (targetId === startId - FIELD_SIZE * i - i && moves['isRightCrossBackwardClear'][i]) ||
            (targetId === startId - FIELD_SIZE * i + i && moves['isLeftCrossBackwardClear'][i]) ||
            (targetId === startId + FIELD_SIZE * i && moves['isStraightForwardClear'][i]) ||
            (targetId === startId - FIELD_SIZE * i && moves['isStraightBackwardClear'][i]) ||
            (targetId === startId + i && moves['isStraightRightClear'][i]) ||
            (targetId === startId - i && moves['isStraightLeftClear'][i])
        ) {
            return true;
        }
    }
    return false;
}

function checkRook(targetId, startId, moves) {
    for (let i = 1; i <= 7; i++) {
        if (
            (targetId === startId + FIELD_SIZE * i && moves['isStraightForwardClear'][i]) ||
            (targetId === startId - FIELD_SIZE * i && moves['isStraightBackwardClear'][i]) ||
            (targetId === startId + i && moves['isStraightRightClear'][i]) ||
            (targetId === startId - i && moves['isStraightLeftClear'][i])
        ) {
            return true;
        }
    }
    return false;
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
        isRightCrossForwardClear[i] = isRightCrossForwardClear[i - 1] !== false && !document.querySelector(`[square-id="${startId + FIELD_SIZE * i + i}"]`)?.firstChild;
        isLeftCrossForwardClear[i] = isLeftCrossForwardClear[i - 1] !== false && !document.querySelector(`[square-id="${startId + FIELD_SIZE * i - i}"]`)?.firstChild;
        isRightCrossBackwardClear[i] = isRightCrossBackwardClear[i - 1] !== false && !document.querySelector(`[square-id="${startId - FIELD_SIZE * i - i}"]`)?.firstChild;
        isLeftCrossBackwardClear[i] = isLeftCrossBackwardClear[i - 1] !== false && !document.querySelector(`[square-id="${startId - FIELD_SIZE * i + i}"]`)?.firstChild;
        isStraightForwardClear[i] = isStraightForwardClear[i - 1] !== false && !document.querySelector(`[square-id="${startId + FIELD_SIZE * i}"]`)?.firstChild;
        isStraightBackwardClear[i] = isStraightBackwardClear[i - 1] !== false && !document.querySelector(`[square-id="${startId - FIELD_SIZE * i}"]`)?.firstChild;
        isStraightRightClear[i] = isStraightRightClear[i - 1] !== false && !document.querySelector(`[square-id="${startId + i}"]`)?.firstChild;
        isStraightLeftClear[i] = isStraightLeftClear[i - 1] !== false && !document.querySelector(`[square-id="${startId - i}"]`)?.firstChild;
    }

    switch (piece) {

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

function changePlayer() {
    playerTurn = playerTurn === 'black' ? 'white' : 'black';
    playerDetails.textContent = playerTurn;
    playerTurn === 'white' ? reverseIds() : revertIds();
}

function reverseIds() {
    const allSquares = document.querySelectorAll('#gameboard .square');
    let index = 0;
    for (const square of allSquares) {
        square.setAttribute('square-id', (FIELD_SIZE * FIELD_SIZE - 1) - index);
        index++;
    }
}


function revertIds() {
    const allSquares = document.querySelectorAll('#gameboard .square');
    let index = 0;
    for (const square of allSquares) {
        square.setAttribute('square-id', index);
        index++;
    }
}

function checkForWin() {
    const kings = Array.from(document.querySelectorAll('#king'));
    let blackWins = !kings.some(king => king.firstChild.classList.contains('white'));
    let whiteWins = !kings.some(king => king.firstChild.classList.contains('black'));

    if (blackWins || whiteWins) {
        infoDisplay.innerHTML = `${blackWins ? "Black" : "White"} Player Wins!`;
        const allSquares = document.querySelectorAll('.square');
        for (const square of allSquares) {
            square.firstChild?.setAttribute('draggable', false);
        }
    }
}