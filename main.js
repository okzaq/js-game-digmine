const BLOCK_NUM_HEIGHT = 23;
const BLOCK_NUM_WIDTH = 20;
const BACK_GROUND_COLOR = '#404040';

const TOUCH_SPACE_SIZE_MIN = 5;

// Block per second
const HORIZONTAL_SPEED = 0.25;
const VERTICAL_SPEED = 0.5;

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
  LEFT_UP : 4,
  RIGHT_UP : 5,
};

const DUG_STATUS = {
  THROUGH : -1,
  DUG : 0,
  GROUND : 1,
};

var background;
var map;
var player;

class Player {
  constructor(x, y, direction, color, ctx, image) {
    this.x = x;
    this.y = y;
    this.rx = x * GAME_MAP.BLOCK_SIZE;
    this.ry = y * GAME_MAP.BLOCK_SIZE;
    this.direction = direction;
    this.preX = this.x;
    this.preY = this.y;
    this.prerX = this.rx;
    this.prerY = this.ry;
    this.preDirection = direction;
    this.color = color;
    this.ctx = ctx;
    this.images = image;
    this.isMoving = false;
    this.lastMoveTime = 0;
    this.timerId = null;
  }

  isJumping() {
    return false;
  }

  allowMoved(dx, dy, direction) {
    if (this.isMoving) {
      return false;
    }
    return true;
  }

  preMove(dx, dy, direction) {
    if (!this.allowMoved(direction)) return;

    this.preX = this.x + dx;
    this.preY = this.y + dy;
    if (this.preX < 0) this.preX = 0;
    if (this.preX >= BLOCK_NUM_WIDTH) this.preX = BLOCK_NUM_WIDTH - 1;
    if (this.preY < 0) this.preY = 0;
    if (this.preY >= BLOCK_NUM_HEIGHT) this.preY = BLOCK_NUM_HEIGHT - 1;

    if (map.existsBlock(this.preX, this.preY)) {
      map.dig(this.preX, this.preY);
      this.preX = this.x;
      this.preY = this.y;
      return;
    }

    this.prerX = this.preX * GAME_MAP.BLOCK_SIZE;
    this.prerY = this.preY * GAME_MAP.BLOCK_SIZE;
    this.preDirection = direction;
    this.isMoving = true;
    this.lastMoveTime = new Date().getTime();
    // this.timerId = setInterval(function(){
    //   player.updateCurrentCoordinate();
    // }, 100);
  }

  clearTimer() {
    // clearInterval(this.timerId);
    // this.timerId = null;
  }

  updateCurrentCoordinate() {
    if (!this.isMoving) {
      return;
    }

    var currentTime = new Date().getTime();
    var dt = (currentTime - this.lastMoveTime) / 1000.0;

    var dx = GAME_MAP.BLOCK_SIZE * HORIZONTAL_SPEED * dt;
    var dy = GAME_MAP.BLOCK_SIZE * VERTICAL_SPEED * dt;
    if (this.x > this.preX) dx *= -1;
    if (this.y > this.preY) dy *= -1;
    var tmpX = this.x + dx;
    var tmpY = this.y + dy;

    if ((dx > 0 && tmpX > this.preX) || (dx < 0 && tmpX < this.preX)) tmpX = this.preX;
    if ((dy > 0 && tmpY > this.preY) || (dy < 0 && tmpY < this.preY)) tmpY = this.preY;
    this.x = tmpX;
    this.y = tmpY;
    this.rx = tmpX * GAME_MAP.BLOCK_SIZE;
    this.ry = tmpY * GAME_MAP.BLOCK_SIZE;

    if (this.x == this.preX && this.y == this.preY) {
      this.isMoving = false;
      this.clearTimer();
    }
  }

  resizeCanvas() {
    this.rx = this.x * GAME_MAP.BLOCK_SIZE;
    this.ry = this.y * GAME_MAP.BLOCK_SIZE;
    this.prerX = this.preX * GAME_MAP.BLOCK_SIZE;
    this.prerY = this.preY * GAME_MAP.BLOCK_SIZE;
  }

  draw() {
    this.updateCurrentCoordinate();

    this.ctx.clearRect(0, 0, GAME_MAP.MAP_WIDTH, GAME_MAP.MAP_HEIGHT);

    // this.ctx.putImageData(this.images[this.direction], this.x, this.y);

    // this.ctx.beginPath();
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.rx,
      this.ry,
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
    this.dugMap = [];
    for (var x = 0; x < BLOCK_NUM_WIDTH; x++) {
      this.dugMap[x] = [];
      for (var y = 0; y < BLOCK_NUM_HEIGHT; y++) {
        this.dugMap[x][y] = DUG_STATUS.GROUND;
      }
    }
    for (var x = 0; x < BLOCK_NUM_WIDTH; x++) {
      this.dugMap[x][0] = DUG_STATUS.THROUGH;
      this.dugMap[x][BLOCK_NUM_HEIGHT - 2] = DUG_STATUS.THROUGH;
    }
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
    // this.ctx.fillStyle = "rgba(255,255,255,0)";
    this.ctx.fillRect(x, y, w, h);
  }

  drawDefaultMapImage() {
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
  }

  createMapImage() {
    this.drawDefaultMapImage();
    this.image = this.ctx.getImageData(0, 0, GAME_MAP.MAP_WIDTH, GAME_MAP.MAP_HEIGHT);
  }

  resizeMapImage() {
    this.drawDefaultMapImage();
    this.clearDugBlocks();
    this.image = this.ctx.getImageData(0, 0, GAME_MAP.MAP_WIDTH, GAME_MAP.MAP_HEIGHT);
  }

  dig(x, y) {
    this.dugMap[x][y] = DUG_STATUS.DUG;
    var tmpCtx = createCanvasWithoutAppend();
    tmpCtx.putImageData(this.image, 0, 0);
    this.clearDugBlock(tmpCtx, x, y);
    this.image = tmpCtx.getImageData(0, 0, GAME_MAP.MAP_WIDTH, GAME_MAP.MAP_HEIGHT);
  }

  existsBlock(x, y) {
    return this.dugMap[x][y] == DUG_STATUS.GROUND;
  }

  clearDugBlocks() {
    for (var x = 0; x < BLOCK_NUM_WIDTH; x++) {
      for (var y = 0; y < BLOCK_NUM_HEIGHT; y++) {
        if (this.dugMap[x][y] == DUG_STATUS.DUG) {
          this.clearDugBlock(this.ctx, x, y);
        }
      }
    }
  }

  clearDugBlock(ctx, x, y) {
    ctx.clearRect(
      (x * GAME_MAP.BLOCK_SIZE) + 1,
      (y * GAME_MAP.BLOCK_SIZE) + 1,
      GAME_MAP.BLOCK_SIZE - 1,
      GAME_MAP.BLOCK_SIZE - 1);
    // ctx.fillStyle = "rgba(255,255,255,0)"//BACK_GROUND_COLOR;
    // ctx.fillRect(
    //   (x * GAME_MAP.BLOCK_SIZE) + 1,
    //   (y * GAME_MAP.BLOCK_SIZE) + 1,
    //   GAME_MAP.BLOCK_SIZE - 1,
    //   GAME_MAP.BLOCK_SIZE - 1);
  }

  draw() {
    this.ctx.clearRect(0, 0, GAME_MAP.MAP_WIDTH, GAME_MAP.MAP_HEIGHT);
    this.ctx.putImageData(this.image, 0, 0);
  }
}

window.addEventListener('load', init);

function init() {
  window.addEventListener('keydown', movePlayer);
  window.addEventListener('resize', resizeCanvases);

  calcMapSize();

  background = new BackGround(createCanvas());
  background.draw();

  map = new GameMap(createCanvas());
  map.createMapImage();

  player = new Player(0, 0, DIRECTION.RIGHT, 'blue', createCanvas());
  player.draw();

  // if ('ontouchstart' in document) {
    createTouchControlPads();
  // }

  requestAnimationFrame(update);
}

function resizeCanvases() {
  calcMapSize();
  var selects = document.getElementsByTagName('canvas');
  Array.prototype.forEach.call(selects, canvas => {
    resizeCanvas(canvas)
  });
  background.draw();
  map.resizeMapImage();
  map.draw();
  resizeTouchControlPads();
  player.resizeCanvas();
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

function createCanvasWithoutAppend() {
  var canvas = document.createElement('canvas');
  resizeCanvas(canvas);

  return canvas.getContext('2d');
}

function update() {
  requestAnimationFrame(update);

  render();
}

function render() {
  // ctx.fillStyle = "black";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  player.draw();
  map.draw();
  background.draw();
}

function moveLeft() {
  player.preMove(-1, 0, DIRECTION.LEFT);
}

function moveUp() {
  player.preMove(0, -1, DIRECTION.UP);
}

function moveRight() {
  player.preMove(1, 0, DIRECTION.RIGHT);
}

function moveDown() {
  player.preMove(0, 1, DIRECTION.DOWN);
}

function moveLeftUp() {
  player.preMove(-1, -1, DIRECTION.LEFT_UP);
}

function moveRightUp() {
  player.preMove(1, -1, DIRECTION.RIGHT_UP);
}

function movePlayer(e) {
  switch (e.keyCode) {
    case 37:  // left
      moveLeft();
      break;

    case 38:  // up
      moveUp();
      break;

    case 39:  // right
      moveRight();
      break;

    case 40:  // down
      moveDown();
      break;
  }
}

var touchControlPads = [];
function resizeTouchControlPads() {
  touchControlPads.forEach(canvas => this.resizeTouchControlPad(canvas));
}

function resizeTouchControlPad(canvas) {
  canvas.style.top    = canvas.dataset.y * GAME_MAP.BLOCK_SIZE;
  canvas.style.left   = canvas.dataset.x * GAME_MAP.BLOCK_SIZE;
  canvas.style.height = canvas.dataset.h * GAME_MAP.BLOCK_SIZE;
  canvas.height       = canvas.dataset.h * GAME_MAP.BLOCK_SIZE;
  canvas.style.width  = canvas.dataset.w * GAME_MAP.BLOCK_SIZE;
  canvas.width        = canvas.dataset.w * GAME_MAP.BLOCK_SIZE;
}

function createTouchControlPad(x, y, w, h) {
  var canvas = document.createElement('canvas');

  canvas.dataset.x = x;
  canvas.dataset.y = y;
  canvas.dataset.w = w;
  canvas.dataset.h = h;
  canvas.style.border = "solid 1px red";
  resizeTouchControlPad(canvas);

  document.getElementById('gamepanel').appendChild(canvas);

  return canvas;
}

function createTouchControlPads() {
  var eventName = 'click';
  var leftUp = createTouchControlPad(
    0,
    0,
    TOUCH_SPACE_SIZE_MIN,
    TOUCH_SPACE_SIZE_MIN);
  leftUp.addEventListener(eventName, moveLeftUp);

  var up = createTouchControlPad(
    TOUCH_SPACE_SIZE_MIN,
    0,
    BLOCK_NUM_WIDTH - (TOUCH_SPACE_SIZE_MIN * 2),
    TOUCH_SPACE_SIZE_MIN);
  up.addEventListener(eventName, moveUp);

  var rightUp = createTouchControlPad(
    BLOCK_NUM_WIDTH - TOUCH_SPACE_SIZE_MIN,
    0,
    TOUCH_SPACE_SIZE_MIN,
    TOUCH_SPACE_SIZE_MIN);
  rightUp.addEventListener(eventName, moveRightUp);

  var left = createTouchControlPad(
    0,
    TOUCH_SPACE_SIZE_MIN,
    TOUCH_SPACE_SIZE_MIN,
    BLOCK_NUM_HEIGHT - (TOUCH_SPACE_SIZE_MIN * 2));
  left.addEventListener(eventName, moveLeft);

  var right = createTouchControlPad(
    BLOCK_NUM_WIDTH - TOUCH_SPACE_SIZE_MIN,
    TOUCH_SPACE_SIZE_MIN,
    TOUCH_SPACE_SIZE_MIN,
    BLOCK_NUM_HEIGHT - (TOUCH_SPACE_SIZE_MIN * 2));
  right.addEventListener(eventName, moveRight);

  var down = createTouchControlPad(
    0,
    BLOCK_NUM_HEIGHT - TOUCH_SPACE_SIZE_MIN,
    BLOCK_NUM_WIDTH,
    TOUCH_SPACE_SIZE_MIN);
  down.addEventListener(eventName, moveDown);

  touchControlPads = [leftUp, up, rightUp, left, right, down];
}
