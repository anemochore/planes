/**
 * Created by anemochore on 2016-09-07;13.
 */
'use strict';

var isMobile = false;

// http://www.gambit.ph/tip-detecting-a-mobile-browser-with-javascript/
if(navigator.userAgent.match(/Mobi/) ) {	// mobile
	isMobile = true;
}

// fps
const FPS = 30;
const INTERVAL = 1000 / FPS;
var now, then, elapsed;

// canvas
var can = document.getElementById('canvas');

var C_WIDTH;
var C_HEIGHT;

if(isMobile) {
	var deviceWidth = window.innerWidth;

	C_WIDTH = deviceWidth - 20;
	C_HEIGHT = C_WIDTH;

  can.addEventListener('touchmove', touchMove);	// drag
	can.addEventListener('touchstart', touchStart);
	can.addEventListener('touchend', touchEnd);
}
else {
	C_WIDTH = 500;  // i think viewport is good to be C_WIDTH * 1.2 + 20
	C_HEIGHT = 500;

	can.addEventListener('mousemove', mouseMove);
  can.addEventListener('mousedown', mouseDown); // for pic
}

can.width = C_WIDTH;
can.height = C_HEIGHT;

const CAN_X_OFFSET = can.offsetLeft - window.pageXOffset;

const CENTER_X = parseInt(C_WIDTH / 2);
const CENTER_Y = parseInt(C_HEIGHT / 2);

// ctx
var ctx = can.getContext('2d');
ctx.textBaseline = 'top';

// touch
var touchStartX;

var isPaused = false; // for pic


///////////////////////////////
//document.getElementById('debug').innerText = '-_-' + C_WIDTH;

var planes = [];
var deltaRotationZ = 0;

var i, j;

makePlanes();
glowOnCanvas();
go();
///////////////////////////////


function makePlanes() {
  // let's make some planes(square)
  const MIN_WIDTH = C_WIDTH * 0.025;
  const MAX_WIDTH = C_WIDTH;
  const WIDTH = MAX_WIDTH - MIN_WIDTH;
  const PLANES_ON_THE_SAME_Z = 8;
  const Z_NUM = 6;
  const PLANES_INNER_ANGLE = 180 / Z_NUM * Math.PI/180;
  const MAX_ALPHA = 0.1;

  var obj;
  for(i = 0; i < Z_NUM; i++) {
    for(j = 0; j < PLANES_ON_THE_SAME_Z; j++) {
      obj = {
        width: MIN_WIDTH + WIDTH * (j+1) / PLANES_ON_THE_SAME_Z,
        x: CENTER_X,
        y: CENTER_Y,
        rotationZ: i * PLANES_INNER_ANGLE,
        r: random2(0, 255),
        g: random2(32, 160),
        b: 0,
        alpha: MAX_ALPHA * (j+1) / PLANES_ON_THE_SAME_Z
      };
      obj.b = 255 - obj.r;

      obj.x -= obj.width / 2;
      obj.y -= obj.width / 2;

      planes.push(obj);
    }
  }
}

function glowOnCanvas() {
  ctx.globalCompositeOperation = 'lighter';
}

function go() {
	then = Date.now();

	// starting loop
	loop();
}

function loop() {
	requestAnimationFrame(loop);

  if(isPaused) return;  // for pic

	// limiting fps
	now = Date.now();
	elapsed = now - then;
	if(elapsed <= INTERVAL) return;

	then = now - (elapsed % INTERVAL);

	update();
}

function update() {
  const PERSPECTIVE = 0.2;

  ctx.clearRect(0, 0, C_WIDTH, C_HEIGHT);

	for(i = 0; i < planes.length; i++) {
    var t = planes[i];
    var tx = t.x;
    var ty = t.y;

    // apply rotationZ
    t.rotationZ += deltaRotationZ;

    if(t.rotationZ > 2 * Math.PI)
      t.rotationZ -= 2 * Math.PI;
    else if(t.rotationZ < -2 * Math.PI)
      t.rotationZ += 2 * Math.PI;

    var rotationZ = t.rotationZ;
    var x1mul = (1 + Math.cos(rotationZ - Math.PI)) / 2;
    var y1mul = Math.sin(rotationZ);

    var width = t.width;
    var height = t.width;
    var x1 = tx + width * x1mul;
    var y1 = ty - height * PERSPECTIVE * y1mul;
    var x2 = tx + width * (1 - x1mul);
    var y2 = ty + height * PERSPECTIVE * y1mul;
    var x3 = x2;
    var y3 = ty + height - height * PERSPECTIVE * y1mul;
    var x4 = x1;
    var y4 = ty + height + height * PERSPECTIVE * y1mul;

    // draw
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.125;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    ctx.fillStyle = rgba(t.r, t.g, t.b, t.alpha);
    ctx.fill();
  }
}


// listeners
function mouseMove(e) {
  const MOVEMENT_MUL = 0.0005;
  var x = e.clientX - CAN_X_OFFSET;
  deltaRotationZ = (x - CENTER_X) * MOVEMENT_MUL;
}

function mouseDown(e) {
  isPaused = !isPaused;
}

function touchMove(e) {
  e.preventDefault();

  var x = e.touches[0].pageX - CAN_X_OFFSET;
  touchEnd(e);
  if(x < C_WIDTH && x > 0)
    touchStartX = x;
}

function touchStart(e) {
	e.preventDefault();

  touchStartX = e.touches[0].pageX - CAN_X_OFFSET;
}

function touchEnd(e) {
  const MOVEMENT_MUL = 0.00275;
  var x = e.touches[0].pageX - CAN_X_OFFSET;
  deltaRotationZ  = (x - touchStartX) * MOVEMENT_MUL;

  //document.getElementById('debug').innerText = x;
}


// utils
function rgba(r, g, b, a) {
	// r,g,b is [0, 255)
	// a is [0, 1)
	return 'rgba(' + String(r>>0) + ',' + String(g>>0) + ',' + String(b>>0) + ',' + a + ')';
}

function random2(min, max) {
  return min + (Math.random() * (max - min));
}