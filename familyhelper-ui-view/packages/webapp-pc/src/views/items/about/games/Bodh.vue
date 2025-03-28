<template>
  <div class="bodh-container" @keydown="handleKeyDown">
    <div class="bodh-wrapper">
      <div class="square-wrapper">
        <div class="square" id="s11"></div>
        <div class="square" id="s12"></div>
        <div class="square" id="s13"></div>
        <div class="square" id="s14"></div>
        <div class="square" id="s21"></div>
        <div class="square" id="s22"></div>
        <div class="square" id="s23"></div>
        <div class="square" id="s24"></div>
        <div class="square" id="s31"></div>
        <div class="square" id="s32"></div>
        <div class="square" id="s33"></div>
        <div class="square" id="s34"></div>
        <div class="square" id="s41"></div>
        <div class="square" id="s42"></div>
        <div class="square" id="s43"></div>
        <div class="square" id="s44"></div>
      </div>
      <button class="direction" id="up" @click="up">↑</button>
      <button class="direction" id="down" @click="down">↓</button>
      <button class="direction" id="left" @click="left">←</button>
      <button class="direction" id="right" @click="right">→</button>
      <button id="new_game" @click="newGame">新游戏</button>
      <div id="score"></div>
      <div id="game_over">游戏结束</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'BodhComponent',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  gaming: boolean
}

defineProps<Props>()

// -----------------------------------------------------------游戏逻辑-----------------------------------------------------------
const canUp = ref<boolean>(true)
const canDown = ref<boolean>(true)
const canLeft = ref<boolean>(true)
const canRight = ref<boolean>(true)
const bornFlag = ref<boolean>(true)

function handleKeyDown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowUp':
      up()
      break
    case 'ArrowDown':
      down()
      break
    case 'ArrowLeft':
      left()
      break
    case 'ArrowRight':
      right()
      break
    default:
      break
  }
}

function gameOver(): void {
  if (!canUp.value && !canDown.value && !canLeft.value && !canRight.value) {
    const gameOverElement = document.getElementById('game_over')
    if (!gameOverElement) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    gameOverElement.style.visibility = 'visible'
  }
}

function newGame(): void {
  const gameOverElement = document.getElementById('game_over')
  if (!gameOverElement) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  gameOverElement.style.visibility = 'hidden'
  const scoreElement = document.getElementById('score')
  if (!scoreElement) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  scoreElement.innerHTML = '0'
  for (let i = 1; i < 5; i += 1) {
    for (let j = 1; j < 5; j += 1) {
      const gridElement = document.getElementById(`s${i}${j}`)
      if (!gridElement) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      gridElement.innerHTML = ''
    }
  }
  canUp.value = true
  canDown.value = true
  canLeft.value = true
  canRight.value = true
  born()
  updateView()
}

function born(): void {
  const randNum = Math.random()
  const newNum = randNum > 0.5 ? 2 : 4
  while (bornFlag.value) {
    const row = Math.ceil(Math.random() * 4)
    const col = Math.ceil(Math.random() * 4)
    const square = document.getElementById(`s${row}${col}`)
    if (!square) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    if (square.innerHTML === '') {
      // noinspection JSValidateTypes
      square.innerHTML = newNum.toString()
      break
    }
  }
}

function up(): void {
  let newSquareNum: number[] = []
  let targetSquare
  let targetExist = false
  let _canUp = false
  for (let i = 1; i < 5; i += 1) {
    for (let j = 2; j < 5; j += 1) {
      const selfSquare = document.getElementById(`s${j}${i}`)
      if (!selfSquare) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      if (selfSquare.innerHTML !== '') {
        for (let k = 1; k < j; k += 1) {
          const preSquare = document.getElementById(`s${j - k}${i}`)
          if (!preSquare) {
            throw new Error('不应该执行到此处, 请联系开发人员')
          }
          if (preSquare.innerHTML === '') {
            targetSquare = preSquare
            targetExist = true
          } else if (
            selfSquare.innerHTML === preSquare.innerHTML &&
            newSquareNum[+((j - k).toString() + i)] === undefined
          ) {
            preSquare.innerHTML = (2 * parseInt(selfSquare.innerHTML)).toString()
            const scoreElement = document.getElementById('score')
            if (!scoreElement) {
              throw new Error('不应该执行到此处, 请联系开发人员')
            }
            scoreElement.innerHTML = (
              parseInt(scoreElement.innerHTML) + parseInt(preSquare.innerHTML)
            ).toString()
            selfSquare.innerHTML = ''
            newSquareNum[+((j - k).toString() + i)] = 1
            _canUp = true
          } else {
            break
          }
        }
        if (targetExist) {
          if (!targetSquare) {
            throw new Error('不应该执行到此处, 请联系开发人员')
          }
          targetSquare.innerHTML = selfSquare.innerHTML
          selfSquare.innerHTML = ''
          _canUp = true
          targetExist = false
        }
      }
    }
    newSquareNum = []
  }
  if (_canUp) {
    canRight.value = true
    canDown.value = true
    canLeft.value = true
    born()
  }
  canUp.value = _canUp
  updateView()
}

function down(): void {
  let newSquareNum: number[] = []
  let targetSquare
  let targetExist = false
  let _canDown = false
  for (let i = 1; i < 5; i += 1) {
    for (let j = 3; j > 0; j -= 1) {
      const selfSquare = document.getElementById(`s${j}${i}`)
      if (!selfSquare) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      if (selfSquare.innerHTML !== '') {
        for (let k = j + 1; k < 5; k += 1) {
          const preSquare = document.getElementById(`s${k}${i}`)
          if (!preSquare) {
            throw new Error('不应该执行到此处, 请联系开发人员')
          }
          if (preSquare.innerHTML === '') {
            targetSquare = preSquare
            targetExist = true
          } else if (
            selfSquare.innerHTML === preSquare.innerHTML &&
            newSquareNum[+(k.toString() + i)] === undefined
          ) {
            preSquare.innerHTML = (2 * parseInt(selfSquare.innerHTML)).toString()
            const scoreElement = document.getElementById('score')
            if (!scoreElement) {
              throw new Error('不应该执行到此处, 请联系开发人员')
            }
            scoreElement.innerHTML = (
              parseInt(scoreElement.innerHTML) + parseInt(preSquare.innerHTML)
            ).toString()
            selfSquare.innerHTML = ''
            newSquareNum[+(k.toString() + i)] = 1
            _canDown = true
            targetExist = false
          } else {
            break
          }
        }
        if (targetExist) {
          if (!targetSquare) {
            throw new Error('不应该执行到此处, 请联系开发人员')
          }
          targetSquare.innerHTML = selfSquare.innerHTML
          selfSquare.innerHTML = ''
          _canDown = true
          targetExist = false
        }
      }
    }
    newSquareNum = []
  }
  if (_canDown) {
    canUp.value = true
    canRight.value = true
    canLeft.value = true
    born()
  }
  canDown.value = _canDown
  updateView()
}

function left(): void {
  let newSquareNum: number[] = []
  let targetSquare
  let targetExist = false
  let _canLeft = false
  for (let j = 1; j < 5; j += 1) {
    for (let i = 2; i < 5; i += 1) {
      const selfSquare = document.getElementById(`s${j}${i}`)
      if (!selfSquare) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      if (selfSquare.innerHTML !== '') {
        for (let k = 1; k < i; k += 1) {
          const preSquare = document.getElementById(`s${j}${i - k}`)
          if (!preSquare) {
            throw new Error('不应该执行到此处, 请联系开发人员')
          }
          if (preSquare.innerHTML === '') {
            targetSquare = preSquare
            targetExist = true
          } else if (
            selfSquare.innerHTML === preSquare.innerHTML &&
            newSquareNum[+(j + (i - k).toString())] === undefined
          ) {
            preSquare.innerHTML = (2 * parseInt(selfSquare.innerHTML)).toString()
            const scoreElement = document.getElementById('score')
            if (!scoreElement) {
              throw new Error('不应该执行到此处, 请联系开发人员')
            }
            scoreElement.innerHTML = (
              parseInt(scoreElement.innerHTML) + parseInt(preSquare.innerHTML)
            ).toString()
            selfSquare.innerHTML = ''
            newSquareNum[+(j + (i - k).toString())] = 1
            _canLeft = true
            targetExist = false
          } else {
            break
          }
        }
        if (targetExist) {
          if (!targetSquare) {
            throw new Error('不应该执行到此处, 请联系开发人员')
          }
          targetSquare.innerHTML = selfSquare.innerHTML
          selfSquare.innerHTML = ''
          _canLeft = true
          targetExist = false
        }
      }
    }
    newSquareNum = []
  }
  if (_canLeft) {
    canUp.value = true
    canDown.value = true
    canRight.value = true
    born()
  }
  canLeft.value = _canLeft
  updateView()
}

function right(): void {
  let newSquareNum: number[] = []
  let targetSquare
  let targetExist = false
  let _canRight = false
  for (let j = 1; j < 5; j += 1) {
    for (let i = 3; i > 0; i -= 1) {
      const selfSquare = document.getElementById(`s${j}${i}`)
      if (!selfSquare) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      if (selfSquare.innerHTML !== '') {
        for (let k = i + 1; k < 5; k += 1) {
          const preSquare = document.getElementById(`s${j}${k}`)
          if (!preSquare) {
            throw new Error('不应该执行到此处, 请联系开发人员')
          }
          if (preSquare.innerHTML === '') {
            targetSquare = preSquare
            targetExist = true
          } else if (
            selfSquare.innerHTML === preSquare.innerHTML &&
            newSquareNum[+(j.toString() + k)] === undefined
          ) {
            preSquare.innerHTML = (2 * parseInt(selfSquare.innerHTML)).toString()
            const scoreElement = document.getElementById('score')
            if (!scoreElement) {
              throw new Error('不应该执行到此处, 请联系开发人员')
            }
            scoreElement.innerHTML = (
              parseInt(scoreElement.innerHTML) + parseInt(preSquare.innerHTML)
            ).toString()
            selfSquare.innerHTML = ''
            newSquareNum[+(j.toString() + k)] = 1
            _canRight = true
            targetExist = false
          } else {
            break
          }
        }
        if (targetExist) {
          if (!targetSquare) {
            throw new Error('不应该执行到此处, 请联系开发人员')
          }
          targetSquare.innerHTML = selfSquare.innerHTML
          selfSquare.innerHTML = ''
          _canRight = true
          targetExist = false
        }
      }
    }
    newSquareNum = []
  }
  if (_canRight) {
    canUp.value = true
    canDown.value = true
    canLeft.value = true
    born()
  }
  canRight.value = _canRight
  updateView()
}

function updateView(): void {
  for (let i = 1; i < 5; i += 1) {
    for (let j = 1; j < 5; j += 1) {
      const square = document.getElementById(`s${i}${j}`)
      if (!square) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      switch (square.innerHTML) {
        case '2':
          square.style.backgroundColor = '#EEE4DA'
          square.style.color = '#766D64'
          break
        case '4':
          square.style.backgroundColor = '#ECE0C8'
          square.style.color = '#786D67'
          break
        case '8':
          square.style.backgroundColor = '#F2B179'
          square.style.color = '#F6F7F2'
          break
        case '16':
          square.style.backgroundColor = '#F59565'
          square.style.color = '#FAF6F5'
          break
        case '32':
          square.style.backgroundColor = '#F77B5F'
          square.style.color = '#FBF3F0'
          break
        case '64':
          square.style.backgroundColor = '#F35F3B'
          square.style.color = '#FAF4F4'
          break
        case '128':
          square.style.backgroundColor = '#EDCE71'
          square.style.color = '#F8FAF7'
          break
        case '256':
          square.style.backgroundColor = '#EDCC61'
          square.style.color = '#FAF6F7'
          break
        case '512':
          square.style.backgroundColor = '#ECC850'
          square.style.color = '#FAF4F6'
          break
        case '1024':
          square.style.backgroundColor = '#EDC53F'
          square.style.color = '#F9F4FA'
          break
        case '2048':
          square.style.backgroundColor = '#E9B501'
          square.style.color = '#FFFCB0'
          break
        case '4096':
          square.style.backgroundColor = '#FCEDD8'
          square.style.color = '#524B39'
          break
        default:
          square.style.backgroundColor = '#FBEFE3'
      }
    }
  }
  gameOver()
}
</script>

<style scoped>
.bodh-container {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.bodh-wrapper {
  width: 424px;
  height: 600px;
  margin: 0 auto;
  border-radius: 15px;
  position: relative;
}

.square-wrapper {
  height: 424px;
  background-color: #c3c0b7;
  border-radius: 8px;
}

.square {
  float: left;
  width: 90px;
  height: 90px;
  margin: 8px;
  background-color: #fbefe3;
  border-radius: 8px;
  color: #59503f;
  text-align: center;
  line-height: 90px;
  font-size: 35px;
}

.direction {
  width: 120px;
  height: 75px;
  border: none;
  border-radius: 8px;
  color: white;
  background-color: #c6bfb9;
  font-size: 45px;
  font-weight: bolder;
  text-align: center;
  line-height: 75px;
}

#new_game {
  width: 120px;
  height: 75px;
  border: none;
  border-radius: 8px;
  background-color: #c6bfb9;
  font-size: 30px;
  color: #fffbf7;
  position: absolute;
  top: 430px;
  left: 0;
  line-height: 75px;
  text-align: center;
}

#up {
  position: absolute;
  top: 430px;
  left: 150px;
}

#left {
  position: absolute;
  top: 512px;
  left: 0;
}

#right {
  position: absolute;
  top: 512px;
  left: 300px;
}

#down {
  position: absolute;
  top: 512px;
  left: 150px;
}

#game_over {
  width: 300px;
  height: 100px;
  color: #ffffff;
  border-radius: 20px;
  background-color: burlywood;
  font-size: 40px;
  position: absolute;
  top: 160px;
  left: 60px;
  text-align: center;
  line-height: 100px;
  visibility: hidden;
}

#score {
  width: 120px;
  height: 75px;
  border-radius: 8px;
  background-color: #c6bfb9;
  font-size: 20px;
  color: #fffbf7;
  position: absolute;
  top: 430px;
  left: 300px;
  line-height: 75px;
  text-align: center;
}
</style>
