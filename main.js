// 1. Показувати фігуру над екраном rowTetro = -2
// 2. Створити UI для розрахунку балів
// 3. Реалізувати самостійний рух

const PLAYFIELD_COLUMNS = 10
const PLAYFIELD_ROWS = 20
const speedDown = 1000

const TETROMINO_NAMES = ['O', 'L', 'J', 'S', 'Z', 'T', 'I']

const TETROMINOES = {
  O: [
    [1, 1],
    [1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
}

let playfield
let tetromino
let stopAutoDownFigure
let score = 0

// Invoke logic
document.addEventListener('keydown', onKeyDown)
generatePlayfield()
generateTetromino()
drawPlayField()
const cells = document.querySelectorAll('.tetris div')
drawTetromino()
// ---------------

function generatePlayfield() {
  for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
    const div = document.createElement('div')
    document.querySelector('.tetris').append(div)
  }

  playfield = new Array(PLAYFIELD_ROWS)
    .fill(0)
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0))
}

function getRandomTetrominoNamesIndex() {
  return Math.floor(Math.random() * TETROMINO_NAMES.length)
}

function generateTetromino() {
  const nameTetro = TETROMINO_NAMES[getRandomTetrominoNamesIndex()]
  const matrixTetro = TETROMINOES[nameTetro]
  const columnTetro = Math.floor(
    PLAYFIELD_COLUMNS / 2 - TETROMINOES[nameTetro].length / 2
  )
  const rowTetro = -2

  tetromino = {
    name: nameTetro,
    matrix: matrixTetro,
    column: columnTetro,
    row: rowTetro,
    color: generateRandomColorRGB(),
  }
  clearInterval(stopAutoDownFigure)
  startAutoDownFigure()
}

function convertPositionToIndex(row, col) {
  return row * PLAYFIELD_COLUMNS + col
}

function drawPlayField() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let col = 0; col < PLAYFIELD_COLUMNS; col++) {
      if (!playfield[row][col]) continue
      const cellIndex = convertPositionToIndex(row, col)
      cells[cellIndex].style.backgroundColor = 'rgb(136, 70, 4)'
    }
  }
}

function generateRandomColorRGB() {
  let red, green, blue

  do {
    red = Math.floor(Math.random() * 256)
    green = Math.floor(Math.random() * 256)
    blue = Math.floor(Math.random() * 256)
  } while (red === 100 && green === 54 && blue === 8)

  return `rgb(${red}, ${green}, ${blue})`
}

function drawTetromino() {
  const tetrominoMatrixSize = tetromino.matrix.length

  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let col = 0; col < tetrominoMatrixSize; col++) {
      if (tetromino.row + row < 0) continue
      if (!tetromino.matrix[row][col]) continue
      const cellIndex = convertPositionToIndex(
        tetromino.row + row,
        tetromino.column + col
      )
      cells[cellIndex].style.backgroundColor = tetromino.color
    }
  }
}

function draw() {
  cells.forEach((cell) => {
    cell.removeAttribute('style')
  })
  drawPlayField()
  drawTetromino()
}

function onKeyDown(event) {
  switch (event.key) {
    case 'ArrowUp':
      rotateTetromino()
      break
    case 'ArrowDown':
      moveTetrominoDown()
      break
    case 'ArrowLeft':
      moveTetrominoLeft()
      break
    case 'ArrowRight':
      moveTetrominoRight()
      break
  }
  draw()
}

function moveTetrominoDown() {
  tetromino.row += 1
  if (isValid()) {
    tetromino.row -= 1
    placeTetromino()
  }
}

function moveTetrominoLeft() {
  tetromino.column -= 1
  if (isValid()) {
    tetromino.column += 1
  }
}

function moveTetrominoRight() {
  tetromino.column += 1
  if (isValid()) {
    tetromino.column -= 1
  }
}

function placeTetromino() {
  const matrixSize = tetromino.matrix.length
  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (!tetromino.matrix[row][col]) continue
      if (gameOver(!playfield[tetromino.row + row])) return
      playfield[tetromino.row + row][tetromino.column + col] =
        tetromino.matrix[row][col]
    }
  }
  const filledRows = findFilledRows()
  removeFillRows(filledRows)
  generateTetromino()
}

function isValid() {
  const matrixSize = tetromino.matrix.length
  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (!tetromino.matrix[row][col]) continue
      if (isOutsideOfGameBoard(row, col) || hasCollisions(row, col)) {
        return true
      }
    }
  }
  return false
}

function hasCollisions(row, col) {
  return playfield[tetromino.row + row]?.[tetromino.column + col]
}

function isOutsideOfGameBoard(row, col) {
  return (
    tetromino.column + col < 0 ||
    tetromino.column + col >= PLAYFIELD_COLUMNS ||
    tetromino.row + row >= playfield.length
  )
}

function rotateTetromino() {
  const oldMetrix = tetromino.matrix
  tetromino.matrix = rotateMatrix(tetromino.matrix)
  if (isValid()) {
    tetromino.matrix = oldMetrix
  }
}

function rotateMatrix(matrixTetromino) {
  const N = matrixTetromino.length
  const rotateMatrix = []
  for (let i = 0; i < N; i++) {
    rotateMatrix[i] = []
    for (let j = 0; j < N; j++) {
      rotateMatrix[i][j] = matrixTetromino[N - j - 1][i]
    }
  }
  return rotateMatrix
}

function findFilledRows() {
  const filledRows = []
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    let filledColumns = 0
    for (let col = 0; col < PLAYFIELD_COLUMNS; col++) {
      if (playfield[row][col]) {
        filledColumns++
      }
    }
    if (filledColumns == PLAYFIELD_COLUMNS) {
      filledRows.push(row)
    }
  }
  return filledRows
}

function removeFillRows(filledRows) {
  if (!filledRows.length) return
  countScore(filledRows.length)
  filledRows.forEach((row) => {
    dropRowsAbove(row)
  })
}

function dropRowsAbove(rowDelete) {
  for (let row = rowDelete; row > 0; row--) {
    playfield[row] = [...playfield[row - 1]]
  }
  score.textContent = score
}

function startAutoDownFigure() {
  stopAutoDownFigure = setInterval(() => {
    moveTetrominoDown()
    draw()
  }, speedDown)
}

function countScore(countRowsToDelete) {
  switch (countRowsToDelete) {
    case 1:
      score += 10
      break
    case 2:
      score += 30
      break
    case 3:
      score += 60
      break
    case 4:
      score += 100
      break
  }
  document.querySelector('.total-score').innerHTML = score
}

function gameOver(isGameOver) {
  clearInterval(stopAutoDownFigure)
  return isGameOver
}
