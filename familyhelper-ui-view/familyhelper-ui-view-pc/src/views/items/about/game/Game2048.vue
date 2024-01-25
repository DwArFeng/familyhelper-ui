<template>
  <div class='wrapper' @keydown="keyboardClick">
    <div class="square-wrapper">
      <div class='square' id='s11'></div>
      <div class='square' id='s12'></div>
      <div class='square' id='s13'></div>
      <div class='square' id='s14'></div>
      <div class='square' id='s21'></div>
      <div class='square' id='s22'></div>
      <div class='square' id='s23'></div>
      <div class='square' id='s24'></div>
      <div class='square' id='s31'></div>
      <div class='square' id='s32'></div>
      <div class='square' id='s33'></div>
      <div class='square' id='s34'></div>
      <div class='square' id='s41'></div>
      <div class='square' id='s42'></div>
      <div class='square' id='s43'></div>
      <div class='square' id='s44'></div>
    </div>
    <button class='direction' id='up' @click="up">↑</button>
    <button class='direction' id='down' @click="down">↓</button>
    <button class='direction' id='left' @click="left">←</button>
    <button class='direction' id='right' @click="right">→</button>
    <button id='new_game' @click="new_game">新游戏</button>
    <div id='score'></div>
    <div id='game_over'>游戏结束</div>
  </div>
</template>
<script>
export default {
  name: 'Game2048',
  data() {
    return {
      can_up: true,
      can_down: true,
      can_left: true,
      can_right: true,
      bornFlag: true,
      interval: null,
      timer: {
        instance: null,
      },
    };
  },
  methods: {
    keyboardClick(event) {
      switch (event.keyCode) {
        case 37:
          this.left();
          break;
        case 38:
          this.up();
          break;
        case 39:
          this.right();
          break;
        case 40:
          this.down();
          break;
        default:
          break;
      }
    },
    game_over() {
      if (!this.can_up && !this.can_down && !this.can_left && !this.can_right) {
        document.getElementById('game_over').style.visibility = 'visible';
      }
    },
    new_game() {
      document.getElementById('game_over').style.visibility = 'hidden';
      for (let i = 1; i < 5; i += 1) {
        for (let j = 1; j < 5; j += 1) {
          document.getElementById(`s${i}${j}`).innerHTML = '';
        }
      }
      this.can_up = true;
      this.can_down = true;
      this.can_left = true;
      this.can_right = true;
      this.born();
    },
    born() {
      const randNum = Math.random();
      const newNum = (randNum > 0.5) ? 2 : 4;
      while (this.bornFlag) {
        const row = Math.ceil(Math.random() * 4);
        const col = Math.ceil(Math.random() * 4);
        const square = document.getElementById(`s${row}${col}`);
        if (square.innerHTML === '') {
          // noinspection JSValidateTypes
          square.innerHTML = newNum;
          break;
        }
      }
    },
    up() {
      let newSquareNum = [];
      let targetSquare;
      let targetExist = false;
      let canUp = false;
      for (let i = 1; i < 5; i += 1) {
        for (let j = 2; j < 5; j += 1) {
          const selfSquare = document.getElementById(`s${j}${i}`);
          if (selfSquare.innerHTML !== '') {
            for (let k = 1; k < j; k += 1) {
              const preSquare = document.getElementById(`s${j - k}${i}`);
              if (preSquare.innerHTML === '') {
                targetSquare = preSquare;
                targetExist = true;
              } else if (selfSquare.innerHTML === preSquare.innerHTML
                && newSquareNum[+((j - k).toString() + i)] === undefined) {
                // noinspection JSValidateTypes
                preSquare.innerHTML = 2 * selfSquare.innerHTML;
                // noinspection JSValidateTypes
                document.getElementById('score').innerHTML = +(document.getElementById('score').innerHTML) + (+preSquare.innerHTML);
                selfSquare.innerHTML = '';
                newSquareNum[+((j - k).toString() + i)] = 1;
                canUp = true;
              } else {
                break;
              }
            }
            if (targetExist) {
              targetSquare.innerHTML = selfSquare.innerHTML;
              selfSquare.innerHTML = '';
              canUp = true;
              targetExist = false;
            }
          }
        }
        newSquareNum = [];
      }
      if (canUp) {
        this.can_right = true;
        this.can_down = true;
        this.can_left = true;
        this.born();
      }
      this.can_up = canUp;
    },
    down() {
      let newSquareNum = [];
      let targetSquare;
      let targetExist = false;
      let canDown = false;
      for (let i = 1; i < 5; i += 1) {
        for (let j = 3; j > 0; j -= 1) {
          const selfSquare = document.getElementById(`s${j}${i}`);
          if (selfSquare.innerHTML !== '') {
            for (let k = j + 1; k < 5; k += 1) {
              const preSquare = document.getElementById(`s${k}${i}`);
              if (preSquare.innerHTML === '') {
                targetSquare = preSquare;
                targetExist = true;
              } else if (selfSquare.innerHTML === preSquare.innerHTML
                && newSquareNum[+((k).toString() + i)] === undefined) {
                // noinspection JSValidateTypes
                preSquare.innerHTML = 2 * selfSquare.innerHTML;
                // noinspection JSValidateTypes
                document.getElementById('score').innerHTML = +(document.getElementById('score').innerHTML) + (+preSquare.innerHTML);
                selfSquare.innerHTML = '';
                newSquareNum[+((k).toString() + i)] = 1;
                canDown = true;
                targetExist = false;
              } else {
                break;
              }
            }
            if (targetExist) {
              targetSquare.innerHTML = selfSquare.innerHTML;
              selfSquare.innerHTML = '';
              canDown = true;
              targetExist = false;
            }
          }
        }
        newSquareNum = [];
      }
      if (canDown) {
        this.can_up = true;
        this.can_right = true;
        this.can_left = true;
        this.born();
      }
      this.can_down = canDown;
    },
    left() {
      let newSquareNum = [];
      let targetSquare;
      let targetExist = false;
      let canLeft = false;
      for (let j = 1; j < 5; j += 1) {
        for (let i = 2; i < 5; i += 1) {
          const selfSquare = document.getElementById(`s${j}${i}`);
          if (selfSquare.innerHTML !== '') {
            for (let k = 1; k < i; k += 1) {
              const preSquare = document.getElementById(`s${j}${i - k}`);
              if (preSquare.innerHTML === '') {
                targetSquare = preSquare;
                targetExist = true;
              } else if (selfSquare.innerHTML === preSquare.innerHTML
                && newSquareNum[+(j + (i - k).toString())] === undefined) {
                // noinspection JSValidateTypes
                preSquare.innerHTML = 2 * selfSquare.innerHTML;
                // noinspection JSValidateTypes
                document.getElementById('score').innerHTML = +(document.getElementById('score').innerHTML) + (+preSquare.innerHTML);
                selfSquare.innerHTML = '';
                newSquareNum[+(j + (i - k).toString())] = 1;
                canLeft = true;
                targetExist = false;
              } else {
                break;
              }
            }
            if (targetExist) {
              targetSquare.innerHTML = selfSquare.innerHTML;
              selfSquare.innerHTML = '';
              canLeft = true;
              targetExist = false;
            }
          }
        }
        newSquareNum = [];
      }
      if (canLeft) {
        this.can_up = true;
        this.can_down = true;
        this.can_right = true;
        this.born();
      }
      this.can_left = canLeft;
    },
    right() {
      let newSquareNum = [];
      let targetSquare;
      let targetExist = false;
      let canRight = false;
      for (let j = 1; j < 5; j += 1) {
        for (let i = 3; i > 0; i -= 1) {
          const selfSquare = document.getElementById(`s${j}${i}`);
          if (selfSquare.innerHTML !== '') {
            for (let k = i + 1; k < 5; k += 1) {
              const preSquare = document.getElementById(`s${j}${k}`);
              if (preSquare.innerHTML === '') {
                targetSquare = preSquare;
                targetExist = true;
              } else if (selfSquare.innerHTML === preSquare.innerHTML
                && newSquareNum[+(j.toString() + k)] === undefined) {
                // noinspection JSValidateTypes
                preSquare.innerHTML = 2 * selfSquare.innerHTML;
                // noinspection JSValidateTypes
                document.getElementById('score').innerHTML = +(document.getElementById('score').innerHTML) + (+preSquare.innerHTML);
                selfSquare.innerHTML = '';
                newSquareNum[+(j.toString() + k)] = 1;
                canRight = true;
                targetExist = false;
              } else {
                break;
              }
            }
            if (targetExist) {
              targetSquare.innerHTML = selfSquare.innerHTML;
              selfSquare.innerHTML = '';
              canRight = true;
              targetExist = false;
            }
          }
        }
        newSquareNum = [];
      }
      if (canRight) {
        this.can_up = true;
        this.can_down = true;
        this.can_left = true;
        this.born();
      }
      this.can_right = canRight;
    },
    stopTimer() {
      if (this.timer.instance === null) {
        return;
      }
      window.clearInterval(this.timer.instance);
    },
    startTimer() {
      if (this.timer.instance !== null) {
        return;
      }
      this.timer.instance = setInterval(() => {
        this.game_over();
        for (let i = 1; i < 5; i += 1) {
          for (let j = 1; j < 5; j += 1) {
            const square = document.getElementById(`s${i}${j}`);
            switch (square.innerHTML) {
              case '2':
                square.style.backgroundColor = '#EEE4DA';
                square.style.color = '#766D64';
                break;
              case '4':
                square.style.backgroundColor = '#ECE0C8';
                square.style.color = '#786D67';
                break;
              case '8':
                square.style.backgroundColor = '#F2B179';
                square.style.color = '#F6F7F2';
                break;
              case '16':
                square.style.backgroundColor = '#F59565';
                square.style.color = '#FAF6F5';
                break;
              case '32':
                square.style.backgroundColor = '#F77B5F';
                square.style.color = '#FBF3F0';
                break;
              case '64':
                square.style.backgroundColor = '#F35F3B';
                square.style.color = '#FAF4F4';
                break;
              case '128':
                square.style.backgroundColor = '#EDCE71';
                square.style.color = '#F8FAF7';
                break;
              case '256':
                square.style.backgroundColor = '#EDCC61';
                square.style.color = '#FAF6F7';
                break;
              case '512':
                square.style.backgroundColor = '#ECC850';
                square.style.color = '#FAF4F6';
                break;
              case '1024':
                square.style.backgroundColor = '#EDC53F';
                square.style.color = '#F9F4FA';
                break;
              case '2048':
                square.style.backgroundColor = '#E9B501';
                square.style.color = '#FFFCB0';
                break;
              case '4096':
                square.style.backgroundColor = '#FCEDD8';
                square.style.color = '#524B39';
                break;
              default:
                square.style.backgroundColor = '#FBEFE3';
            }
          }
        }
      }, 10);
    },
  },
  mounted() {
    this.startTimer();
  },
  watch: {
    $route(val) {
      if (val.name === 'about') {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    },
  },
};

</script>

<style scoped>
.wrapper {
  width: 424px;
  height: 600px;
  background-color: #FFFFFF;
  margin: 0 auto;
  border-radius: 15px;
  position: relative;
}

.square-wrapper{
  height: 424px;
  background-color: #C3C0B7;
  border-radius: 8px;
}

.square {
  float: left;
  width: 90px;
  height: 90px;
  margin: 8px;
  background-color: #FBEFE3;
  border-radius: 8px;
  color: #59503F;
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
  background-color: #C6BFB9;
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
  background-color: #C6BFB9;
  font-size: 30px;
  color: #FFFBF7;
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
  color: #FFFFFF;
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
  background-color: #C6BFB9;
  font-size: 20px;
  color: #FFFBF7;
  position: absolute;
  top: 430px;
  left: 300px;
  line-height: 75px;
  text-align: center;
}
</style>
