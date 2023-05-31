'use strict'

var gBoard = []
var gLevel = {
    SIZE: 4,
    MINES: 2
}
const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function onInit() {
    gGame.isOn = false
    gBoard = buildBoard()
    renderBoard(gBoard)
}

function buildBoard(board) {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gLevel.SIZE; j++) {
            var showCell = (board[i][j].isShown) ? board[i][j].minesAroundCount : 0
            if (showCell === 0) showCell = ''
            var classList = (board[i][j].isMarked) ? 'marked' : 'cell'
            if (board[i][j].isMine && board[i][j].isShown) classList = 'mine'
            strHTML += `<td class="${classList}"
                      onclick="onCellClicked(this,${i},${j})">
                       ${showCell}
                  </td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            getNbrMineCount(i, j)
        }
    }
}

function getNbrMineCount(rowIdx, colIdx) {
    // Check how many neighbors mines the cell has
    var nbrMineCount = 0
    for (var i = rowIdx - 1; i < rowIdx + 2; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j < colIdx + 2; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (gBoard[i][j].isMine) nbrMineCount++
        }
    }
    if (gBoard[rowIdx][colIdx].minesAroundCount === '*') return
    gBoard[rowIdx][colIdx].minesAroundCount = nbrMineCount
}

function onCellClicked(elCell, i, j) {
    var currCell = gBoard[i][j]
    // var MinesGenerated = false
    if (currCell.isShown) return
    currCell.isShown = true
    currCell.isMarked = true

    if (currCell.isMine) {
        currCell.minesAroundCount = '*'
        renderBoard(gBoard)
        // checkGameOver()
        return
    }
    if (currCell.minesAroundCount === 0) expandShown(i, j)
    // gBoard[0][0].isMine = true
    // gBoard[0][1].isMine = true
    if (!gGame.isOn) {
        gGame.isOn = addRandomMines()
        setMinesNegsCount(gBoard)
    }
    renderBoard(gBoard)
}

function addRandomMines() {
    // Adding random mines to the board
    for (var i = 0; i < gLevel.MINES; i++) {
        var ranRowIdx = getRandomInt(0, gLevel.SIZE - 1)
        var ranColIdx = getRandomInt(0, gLevel.SIZE - 1)
        if (gBoard[ranRowIdx][ranColIdx].isMarked){
            i--
            continue
        }
        gBoard[ranRowIdx][ranColIdx].isMine = true
        console.log(i)
    }
    return true
}

function chooseLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
}

function onCellMarked(elCell) {

}

function checkGameOver() {

}

function expandShown(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i < rowIdx + 2; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j < colIdx + 2; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            gBoard[i][j].isMarked = true
            gBoard[i][j].isShown = true
        }
    }
}