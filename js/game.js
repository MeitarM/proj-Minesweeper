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
var firstClick = true
const SMILE = '😀'
const SAD = '😥'
const WIN = '😎'

function onInit() {
    gGame.isOn = false
    const elEmoji = document.querySelector('.top span1')
    elEmoji.innerHTML = SMILE
    gBoard = buildBoard()
    renderBoard(gBoard)
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isFlaged: false
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
            var classList = 'cell'
            var showCell = ''

            if (board[i][j].isShown) {
                if (board[i][j].minesAroundCount) showCell = board[i][j].minesAroundCount
                console.log('test',board[i][j].minesAroundCount)
                classList = 'marked'
            }

            if (board[i][j].isMine && board[i][j].isShown) classList = 'mine'
            if (board[i][j].isFlaged) showCell = '❗'
            strHTML += `<td class="${classList}" 
                      onclick="onCellClicked(this,${i},${j})" data-i="${i}" data-j="${j}">
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
            if (gBoard[i][j].isShown) continue
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

window.addEventListener('contextmenu', (event) => {
    var currLoc = event.target.dataset
    if (typeof currLoc.i !== 'string') return
    gBoard[currLoc.i][currLoc.j].isFlaged = !(gBoard[currLoc.i][currLoc.j].isFlaged)
    renderBoard(gBoard)
})

function onCellClicked(elCell, i, j) {
    var currCell = gBoard[i][j]
    if (!gGame.isOn) {
        gGame.isOn = true
        currCell.minesAroundCount = 0
        addRandomMines(i,j)
        setMinesNegsCount(gBoard)
    }

    if (currCell.isShown) return
    if (currCell.isFlaged) return

    currCell.isShown = true

    if (currCell.isMine) {
        currCell.minesAroundCount = '*'
        renderBoard(gBoard)
        checkGameOver()
        return
    }
    if (currCell.minesAroundCount === 0) expandShown(i, j)
    renderBoard(gBoard)
}

function addRandomMines(rowIdx,colIdx) {
    // Adding random mines to the board
    for (var i = 0; i < gLevel.MINES; i++) {
        var ranRowIdx = getRandomInt(0, gLevel.SIZE - 1)
        var ranColIdx = getRandomInt(0, gLevel.SIZE - 1)
        if (gBoard[ranRowIdx][ranColIdx].isShown || gBoard[ranRowIdx][ranColIdx].isMine) {
            i--
            continue
        }
        
        gBoard[ranRowIdx][ranColIdx].isMine = true
    }
}

function chooseLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
}

function onCellMarked(elCell) {

}

function checkGameOver() {
    const elEmoji = document.querySelector('.top span1')
    elEmoji.innerHTML = SAD
}

function expandShown(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i < rowIdx + 2; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j < colIdx + 2; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (gBoard[i][j].isShown || gBoard[i][j].isFlaged || (i === rowIdx && j === colIdx) ) continue
        
            gBoard[i][j].isShown = true
            if (gBoard[i][j].minesAroundCount === 0) expandShown(i,j)
        }
    }
    renderBoard(gBoard)
}

  