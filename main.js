const BLOCK_NUM_HEIGHT = 23;
const BLOCK_NUM_WIDTH = 20;
// const BACK_GROUND_COLOR = 'dimgray';
const BACK_GROUND_COLOR = '#404040';

var GAME_MAP = {
  MAP_HEIGHT : 0,
  MAP_WIDTH : 0,
  BLOCK_SIZE : 0,
};

const DIRECTION = {
  UP : 0,
  RIGHT : 1,
  LEFT : 2,
  DOWN : 3,
};

var background;
var map;
var player;

// function getRgb(colorName) {
//   var canvas = document.createElement('canvas');
//   canvas.style.height = 1;
//   canvas.style.width = 1;
//   var ctx = canvas.getContext('2d');
//   ctx.fillStyle = colorName;
//   ctx.fillRect(0, 0, 1, 1);
//   var img = ctx.getImageData(0, 0, 1, 1);
//   return {r : img.data[0], g : img.data[1], b : img.data[2]};
// }

class Actor {
  constructor(x, y, direction, color, ctx, image) {
    this.x = x;
    this.y = y;
    this.direction = direction;  // up:0, right:1, down:2, left:3

    this.preX = x;
    this.preY = y;
    this.preDirection = direction;

    this.color = color;
    this.ctx = ctx;

    this.images = image;
    // this.images[DIRECTION.UP] = createActorImage(imageMatrix, color, DIRECTION.UP);
    // this.images[DIRECTION.RIGHT] = createActorImage(imageMatrix, color, DIRECTION.RIGHT);
    // this.images[DIRECTION.DOWN] = createActorImage(imageMatrix, color, DIRECTION.DOWN);
    // this.images[DIRECTION.LEFT] = createActorImage(imageMatrix, color, DIRECTION.LEFT);
  }

  preMove(dx, dy, direction) {
    this.preX = this.x + dx;
    this.preY = this.y + dy;
    if (this.preX < 0) this.preX = 0;
    if ((this.preX + GAME_MAP.BLOCK_SIZE) > GAME_MAP.MAP_WIDTH) this.preX = GAME_MAP.MAP_WIDTH - GAME_MAP.BLOCK_SIZE;
    if (this.preY < 0) this.preY = 0;
    if ((this.preY + GAME_MAP.BLOCK_SIZE) > GAME_MAP.MAP_HEIGHT) this.preY = GAME_MAP.MAP_HEIGHT - GAME_MAP.BLOCK_SIZE;
    this.x = this.preX;
    this.y = this.preY;
    this.preDirection = direction;
  }

  draw() {
    this.ctx.clearRect(0, 0, GAME_MAP.MAP_WIDTH, GAME_MAP.MAP_HEIGHT);

    // this.ctx.putImageData(this.images[this.direction], this.x, this.y);

    // this.ctx.beginPath();
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.x,
      this.y,
      GAME_MAP.BLOCK_SIZE,
      GAME_MAP.BLOCK_SIZE);
  };
}

class BackGround {
  constructor(ctx) {
    this.ctx = ctx;
  }

  draw() {
    this.ctx.clearRect(0, 0, GAME_MAP.MAP_WIDTH, GAME_MAP.MAP_HEIGHT);

    // this.ctx.beginPath();
    this.ctx.fillStyle = BACK_GROUND_COLOR;
    this.ctx.fillRect(
      0,
      0,
      GAME_MAP.MAP_WIDTH,
      GAME_MAP.BLOCK_SIZE);
  }
}

class GameMap {
  constructor(ctx) {
    this.ctx = ctx;
    this.image = null;
    this.isAdoveGround = true;
  }

  drawLine(x1, y1, x2, y2) {
    // this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = 'silver';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  drawGround() {
    var img = document.getElementById('ground_image');
    for (var yOffset = 0; yOffset <= GAME_MAP.MAP_HEIGHT; yOffset += img.height) {
      for (var xOffset = 0; xOffset <= GAME_MAP.MAP_WIDTH; xOffset += img.width) {
        this.ctx.drawImage(img, xOffset, yOffset, img.width, img.height);
      }
    }
  }

  drawGrid() {
    for (var yOffset = GAME_MAP.BLOCK_SIZE; yOffset < GAME_MAP.MAP_HEIGHT - 1; yOffset += GAME_MAP.BLOCK_SIZE) {
      this.drawLine(0, yOffset, GAME_MAP.MAP_WIDTH, yOffset);
    }
    for (var xOffset = GAME_MAP.BLOCK_SIZE; xOffset < GAME_MAP.MAP_WIDTH - 1; xOffset += GAME_MAP.BLOCK_SIZE) {
      this.drawLine(xOffset, 0, xOffset, GAME_MAP.MAP_HEIGHT);
    }
  }

  drawSky() {
    if (this.isAdoveGround) {
      // this.ctx.beginPath();
      this.ctx.fillStyle = 'skyblue';
      this.ctx.fillRect(
        0,
        0,
        GAME_MAP.MAP_WIDTH,
        GAME_MAP.BLOCK_SIZE);
    }
  }

  drawGrass() {
    if (this.isAdoveGround) {
      // this.ctx.beginPath();
      this.ctx.fillStyle = 'green';
      this.ctx.fillRect(
        0,
        GAME_MAP.BLOCK_SIZE,
        GAME_MAP.MAP_WIDTH,
        GAME_MAP.BLOCK_SIZE / 2);
    }
  }

  clearMapCoordinate(x, y) {
    this.clearMapRect(
      x * GAME_MAP.BLOCK_SIZE,
      y * GAME_MAP.BLOCK_SIZE,
      GAME_MAP.BLOCK_SIZE,
      GAME_MAP.BLOCK_SIZE);
  }

  clearMapRect(x, y, w, h) {
    // this.ctx.beginPath();
    this.ctx.fillStyle = BACK_GROUND_COLOR;
    this.ctx.fillRect(x, y, w, h);
  }

  createMapImage() {
    this.ctx.clearRect(0, 0, GAME_MAP.MAP_WIDTH, GAME_MAP.MAP_HEIGHT);

    this.drawGround();
    this.drawGrass();
    this.clearMapRect(
      0,
      GAME_MAP.BLOCK_SIZE * (BLOCK_NUM_HEIGHT - 2),
      GAME_MAP.MAP_WIDTH,
      GAME_MAP.BLOCK_SIZE);
    this.drawGrid();
    this.drawSky();

    this.image = this.ctx.getImageData(0, 0, GAME_MAP.MAP_WIDTH, GAME_MAP.MAP_HEIGHT);
  }

  draw() {
    this.ctx.clearRect(0, 0, GAME_MAP.MAP_WIDTH, GAME_MAP.MAP_HEIGHT);
    this.ctx.putImageData(this.image, 0, 0);
  }
}

window.addEventListener('load', init);
window.addEventListener('keydown', movePlayer);
window.addEventListener('resize', resizeCanvases);

function init() {
  calcMapSize();

  background = new BackGround(createCanvas());
  background.draw();

  map = new GameMap(createCanvas());
  map.createMapImage();

  player = new Actor(0, 0, DIRECTION.RIGHT, 'blue', createCanvas(), null);
  player.draw();

  requestAnimationFrame(update);
}

function resizeCanvases() {
  calcMapSize();
  var selects = document.getElementsByTagName('canvas');
  Array.prototype.forEach.call(selects, canvas => {
    resizeCanvas(canvas)
  });
  background.draw();
}

function resizeCanvas(canvas) {
  canvas.style.height = GAME_MAP.MAP_HEIGHT;
  canvas.height = GAME_MAP.MAP_HEIGHT;
  canvas.style.width = GAME_MAP.MAP_WIDTH;
  canvas.width = GAME_MAP.MAP_WIDTH;
}

function calcMapSize() {
  var rw = window.innerWidth;
  var rh = window.innerHeight;
  var sw = Math.floor(rw / BLOCK_NUM_WIDTH);
  var sh = Math.floor(rh / BLOCK_NUM_HEIGHT);
  var blockSize = sw < sh ? sw : sh;

  GAME_MAP.BLOCK_SIZE = blockSize;
  GAME_MAP.MAP_WIDTH = BLOCK_NUM_WIDTH * blockSize;
  GAME_MAP.MAP_HEIGHT = BLOCK_NUM_HEIGHT * blockSize;
}

function createCanvas() {
  var canvas = document.createElement('canvas');
  resizeCanvas(canvas);

  document.getElementById('gamepanel').appendChild(canvas);

  return canvas.getContext('2d');
}

function update() {
  requestAnimationFrame(update);

  render();
}

function render() {
  // ctx.fillStyle = "black";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  background.draw();
  map.draw();
  player.draw();
}

function movePlayer(e) {
  var step = GAME_MAP.BLOCK_SIZE;
  // var step = 1;
  var dx = 0;
  var dy = 0;
  var direction = player.direction;
  switch (e.keyCode) {
    case 37:  // left
      dx -= step;
      direction = DIRECTION.LEFT;
      break;

    case 38:  // up
      dy -= step;
      direction = DIRECTION.UP;
      break;

    case 39:  // right
      dx += step;
      direction = DIRECTION.RIGHT;
      break;

    case 40:  // down
      dy += step;
      direction = DIRECTION.DOWN;
      break;
  }
  player.preMove(dx, dy, direction);
}
