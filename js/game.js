'use strict'

var gGame
var gBoard
var gManualMines
var gMegaHint
var gClickHistory = []
var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gClickHint = false
const SMILE = '😀'
const SAD = '😥'
const WIN = '😎'
const HINT_ACTIVE = '🌕'
const HINT_DEACTIVE = '🌑'
const LIFE = '💖'

function onInit() {
    gameDefault()
    gBoard = buildBoard()
    renderBoard(gBoard)
}

function gameDefault() {
    gGame = {
        isOn: false,
        score: gLevel.MINES,
        realScore: gLevel.MINES,
        secsPassed: 0,
        lifes: 3,
        safe: 3
    }
    gManualMines = {
        isClicked: false,
        mineCount: 0
    }
    gMegaHint = {
        isClicked: false,
        cellNum: 0,
        cells : []
    }
    closeModal()
    stopTimer()
    clearTimer()
    const elEmoji = document.querySelector('.top span1')
    elEmoji.innerHTML = SMILE
    var elLifes = document.querySelector('.hint1')
    elLifes.innerHTML = HINT_ACTIVE
    var elLifes = document.querySelector('.hint2')
    elLifes.innerHTML = HINT_ACTIVE
    var elLifes = document.querySelector('.hint3')
    elLifes.innerHTML = HINT_ACTIVE
    var elScore = document.querySelector('.top span')
    elScore.innerHTML = +gGame.score
    var elMine = document.querySelector('.manMine')
    elMine.innerText = 'Add Manually Mines'
    var elLifes = document.querySelector('.top span2')
    elLifes.innerHTML = '💖💖💖'
    var elLifes = document.querySelector('.safe')
    elLifes.innerHTML = gGame.safe
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
                classList = 'marked'
            }
            if (board[i][j].isMine && board[i][j].isShown) {
                classList = 'mine'
                showCell = '*'
            }
            if (board[i][j].isFlaged) showCell = '❗'

            strHTML += `<td class="${classList}" 
                      onclick="onCellClicked(this,${i},${j})" data-i="${i}" data-j="${j}"
                      oncontextmenu="onCellMarked(event,${i},${j})"
                      >
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
    if (gBoard[rowIdx][colIdx].isMine) return
    gBoard[rowIdx][colIdx].minesAroundCount = nbrMineCount
}

function onCellMarked(event, i, j) {
    event.preventDefault()
    gBoard[i][j].isFlaged = !gBoard[i][j].isFlaged
    clickHistory(i, j)
    if (gBoard[i][j].isFlaged) {
        updateScore(-1, 0)
        if (gBoard[i][j].isMine) updateScore(0, -1)
    } else if (!gBoard[i][j].isFlaged) {
        updateScore(1, 0)
        if (gBoard[i][j].isMine) updateScore(0, 1)
    }
    renderBoard(gBoard)
}

function onCellClicked(elCell, i, j) {
    var currCell = gBoard[i][j]
    if (gManualMines.isClicked) {
        addMinesManualy(currCell)
        return
    }
    if (gMegaHint.isClicked) {
        megaHint(i,j)
        return
    }
    if (!gGame.isOn) {
        startTimer()
        if (gManualMines.mineCount !== gLevel.MINES) addRandomMines(i, j)
        setMinesNegsCount(gBoard)
        gGame.isOn = true
    }
    clickHistory(i, j)
    console.log(gClickHint)
    if (gClickHint) {
        console.log('check')
        showHint(elCell, i, j)
        return
    }

    if (currCell.isShown) return
    if (currCell.isFlaged) return
    
    currCell.isShown = true

    if (currCell.isMine) {
        updateScore(-1, -1)
        renderBoard(gBoard)
        checkGameOver()
        return
    }
    if (currCell.minesAroundCount === 0) expandShown(i, j)
    renderBoard(gBoard)
}

function addRandomMines(rowIdx, colIdx) {
    // Adding random mines to the board
    for (var i = 0; i < gLevel.MINES; i++) {
        var ranRowIdx = getRandomInt(0, gLevel.SIZE - 1)
        var ranColIdx = getRandomInt(0, gLevel.SIZE - 1)

        if (gBoard[ranRowIdx][ranColIdx].isShown || gBoard[ranRowIdx][ranColIdx].isMine || (ranRowIdx === rowIdx && ranColIdx === colIdx)) {
            i--
        } else {
            gBoard[ranRowIdx][ranColIdx].isMine = true
        }
    }
}

function chooseLevel(size, mines) {
    // Game difficulty
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
}

function checkGameOver() {
    // check if lost
    gGame.lifes--
    const elLifes = document.querySelector('.top span2')
    elLifes.innerHTML = ''
    for (var i=0;i<gGame.lifes;i++) elLifes.innerHTML += LIFE
    if (gGame.lifes === 0) {
        const elEmoji = document.querySelector('.top span1')
        elEmoji.innerHTML = SAD
        stopTimer()
        openModal('Game Over')
    }
}

function expandShown(rowIdx, colIdx) {
    // show neighboring cells if the current cell is 0
    for (var i = rowIdx - 1; i < rowIdx + 2; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j < colIdx + 2; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue

            if (gBoard[i][j].isShown || gBoard[i][j].isFlaged || (i === rowIdx && j === colIdx)) continue
            gBoard[i][j].isShown = true
            clickHistory(i, j)
            if (!gGame.isOn) {
                continue
            }
            if (!gBoard[i][j].minesAroundCount) expandShown(i, j)
        }
    }
    renderBoard(gBoard)
}

function openModal(msg) {
    // opened a modal with a msg of choosing
    const elModal = document.querySelector('.modal')
    const elMsg = elModal.querySelector('.msg')
    elMsg.innerText = msg
    elModal.style.display = 'block'
}

function closeModal() {
    const elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
}

function showHint(elHint, rowIdx, colIdx) {
    // show the curr cell and its neighboors for 1 sec
    console.log(gClickHint)
    if (elHint.innerText === HINT_DEACTIVE) return
    if (!gClickHint) {
        gClickHint = true
        elHint.innerText = HINT_DEACTIVE
        return
    }
    var hintNeighbors = []
    for (var i = rowIdx - 1; i < rowIdx + 2; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j < colIdx + 2; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue

            if (gBoard[i][j].isShown) continue
            gBoard[i][j].isShown = true
            hintNeighbors.push({ i, j })
        }
    }
    renderBoard(gBoard)
    setTimeout(() => hideHint(hintNeighbors, elHint), 1000)
}

function hideHint(hintNeighbors, elHint) {
    for (var i = 0; i < hintNeighbors.length; i++) {
        var row = hintNeighbors[i].i
        var col = hintNeighbors[i].j
        gBoard[row][col].isShown = false
        elHint.innerText = ''
        elHint.classList.remove = 'marked'
    }
    gClickHint = false
    renderBoard(gBoard)
}

function updateScore(num, realNum) {
    // updating and checking score if won
    gGame.score += num
    gGame.realScore += realNum
    var elScore = document.querySelector('.top span')
    elScore.innerText = gGame.score

    if (gGame.realScore === 0) {
        openModal('You Have Won!!')
    }
}

function safeCell(elSafe) {
    // reveal safe cell
    var safeCells = []
    if (gGame.safe === 0) return
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown && !gBoard[i][j].isFlaged) safeCells.push(gBoard[i][j])
        }
    }
    if (!safeCells.length) return
    var ranIdx = getRandomInt(0, safeCells.length)
    safeCells[ranIdx].isShown = true
    gGame.safe--
    elSafe.innerHTML = gGame.safe
    renderBoard(gBoard)
}

function addMinesManualy(currCell) {
    // Adding mines by the players input
    if (currCell.isMine) return
    if (!gManualMines.isClicked) {
        gManualMines.isClicked = true
        currCell.innerText = `Enter ${gLevel.MINES} mines`
        return
    }
    var elMine = document.querySelector('.manMine')
    gManualMines.mineCount++
    elMine.innerText = `Enter ${(gLevel.MINES - gManualMines.mineCount)} mines`
    currCell.isMine = true
    if (gManualMines.mineCount === gLevel.MINES) {
        gManualMines.isClicked = false
        elMine.innerText = `Done, Have Fun Cheater`
    }
}

function clickHistory(i, j) {
    gClickHistory.push({ i, j })
}

function undoBtn() {
    if (!gClickHistory.length) return
    var i = gClickHistory[gClickHistory.length - 1].i
    var j = gClickHistory[gClickHistory.length - 1].j
    gClickHistory.pop()
    if (gBoard[i][j].isFlaged) gBoard[i][j].isFlaged = false
    if (gBoard[i][j].isShown) gBoard[i][j].isShown = false
    if (gBoard[i][j].isMine) updateScore(1,1)
    renderBoard(gBoard)
}

function megaHint(i,j) {
    if (gMegaHint.cellNum === 2) return
    if (!gMegaHint.isClicked) {
        gMegaHint.isClicked = true
        return
    }
    gMegaHint.cells.push({i,j})
    gMegaHint.cellNum++
    if (gMegaHint.cellNum !== 2) return
    var cell1 = gMegaHint.cells[0]
    var cell2 = gMegaHint.cells[1]
    for (var i=cell1.i ; i<=cell2.i;i++){
        for (var j=cell1.j; j<=cell2.j;j++){
            gBoard[i][j].isShown = true
        }
    }
    gMegaHint.isClicked = false
    renderBoard(gBoard)
    setTimeout(() => hideMegaHint(), 2000)

}

function hideMegaHint(){
    var cell1 = gMegaHint.cells[0]
    var cell2 = gMegaHint.cells[1]
    for (var i=cell1.i ; i<=cell2.i;i++){
        for (var j=cell1.j; j<=cell2.j;j++){
            gBoard[i][j].isShown = false
        }
    }
    renderBoard(gBoard)
}

function removeMines(){
    var mines = []
    for (var i=0;i<gBoard.length;i++){
        for (var j=0;j<gBoard[0].length;j++){
            if (gBoard[i][j].isMine) mines.push({i,j})
        }
    }
    for (var x=0;x<3;x++){
        if (!mines.length) return
        gGame.score--
        gGame.realScore--
        var ranIdx = getRandomInt(0,mines.length-1)
        gBoard[mines[ranIdx].i][mines[ranIdx].j].isMine = false
    }
    
    updateScore(0,0)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}