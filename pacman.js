const game = {
  state: 'initial', // playing, paused, initial, over
  score: 0,
  time: 60,
  data: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 2, 1, 1, 0, 1],
    [1, 0, 1, 1, 3, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 9, 1, 1, 1, 1]
  ], // 0 - wall, 1 - food, 2 - ghost, 3 - ghost, 9 - pacman
  origin: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 2, 1, 1, 0, 1],
    [1, 0, 1, 1, 3, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 9, 1, 1, 1, 1]
  ],
  hero: null,
  enemy1: null,
  enemy2: null,
  width: 600,
  height: 600,
  cellSize: 60,
  rows: 10,
  cols: 9,
  canvas: null,
  gl: null,
  program: null,
  shader: {
    vertex: null,
    fragment: null
  }
}

class Square {
  constructor(width, height, color, x, y, col, row) {
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = x;
    this.y = y;
    this.col = col;
    this.row = row;

    this.vertices = new Float32Array([
      this.x, this.y,
      this.x + this.width, this.y,
      this.x, this.y + this.height,
      this.x + this.width, this.y + this.height
    ]);
  }

  draw(gl) {
    const program = gl.createProgram();
    gl.attachShader(program, game.shader.vertex);
    gl.attachShader(program, game.shader.fragment);
    gl.linkProgram(program);

    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      var error = gl.getProgramInfoLog(program);
      console.log('Failed to link program: ' + error);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return null;
    }
    gl.useProgram(program);
    gl.program = program;

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var colorLocation = gl.getUniformLocation(program, "u_color");
    gl.uniform4fv(colorLocation, this.color);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  aiMove1(type) {
    var x = this.col;
    var y = this.row;
    var dir = Math.floor(Math.random() * 4);
    var dirX = 0;
    var dirY = 0;
    if (dir == 0) {
      dirX = 1;
    } else if (dir == 1) {
      dirX = -1;
    } else if (dir == 2) {
      dirY = 1;
    } else {
      dirY = -1;
    }
    if (y + dirY > 8 || y + dirY < 0) {
      return;
    }
    if (x + dirX > 8 || x + dirX < 0) {
      return;
    }
    if (game.data[y + dirY][x + dirX] === 9) {
      game.score -= 500;
      // reset
      if (type === 2) {
        game.data[4][4] = 2;
        game.data[this.row][this.col] = 1;
        return;
      }
      if (type === 3) {
        game.data[5][4] = 3;
        game.data[this.row][this.col] = 1;
        return;
      }
      if (game.score <= 0) {
        game.state = "over"
        return;
      }
    }
    if (game.data[y + dirY][x + dirX] !== 0
      && game.data[y + dirY][x + dirX] !== 2
      && game.data[y + dirY][x + dirX] !== 3
      && game.data[y + dirY][x + dirX] !== -1) {
      if (game.origin[this.row][this.col] !== 2 && game.origin[this.row][this.col] !== 3) {
        game.data[this.row][this.col] = game.origin[this.row][this.col];
      } else {
        game.data[this.row][this.col] = -1;
      }
      this.col += dirX;
      this.row += dirY;
      game.data[this.row][this.col] = type;
    }
  }

  aiMove2(type) {
    var x = this.col;
    var y = this.row;
    var dir = Math.floor(Math.random() * 4);
    var dirX = 0;
    var dirY = 0;
    if (dir == 0) {
      dirX = 1;
    } else if (dir == 1) {
      dirX = -1;
    } else if (dir == 2) {
      dirY = 1;
    } else {
      dirY = -1;
    }
    if (y + dirY > 8 || y + dirY < 0) {
      return;
    }
    if (x + dirX > 8 || x + dirX < 0) {
      return;
    }
    if (game.data[y + dirY][x + dirX] === 9) {
      game.score -= 500;
      // reset
      if (type === 2) {
        game.data[4][4] = 2;
        game.data[this.row][this.col] = 1;
        return;
      }
      if (type === 3) {
        game.data[5][4] = 3;
        game.data[this.row][this.col] = 1;
        return;
      }
      if (game.score <= 0) {
        game.state = "over"
        return;
      }
    }
    if (game.data[y + dirY][x + dirX] !== 0
      && game.data[y + dirY][x + dirX] !== 2
      && game.data[y + dirY][x + dirX] !== 3
      && game.data[y + dirY][x + dirX] !== -1) {
      if (game.origin[this.row][this.col] !== 2 && game.origin[this.row][this.col] !== 3) {
        game.data[this.row][this.col] = game.origin[this.row][this.col];
      } else {
        game.data[this.row][this.col] = -1;
      }
      this.col += dirX;
      this.row += dirY;
      game.data[this.row][this.col] = type;
    }
  }
}

class Circle {
  constructor(radius, color, x, y) {
    this.radius = radius;
    this.color = color;
    this.x = x;
    this.y = y;

    var N = 100;
    var vertexData = [this.x, this.y];
    var r = this.radius;

    for (var i = 0; i <= N; i++) {
        var theta = i * 2 * Math.PI / N;
        var x = r * Math.sin(theta) + this.x;
        var y = r * Math.cos(theta) + this.y;
        vertexData.push(x, y);
    }

    this.vertices = new Float32Array(vertexData);
  }

  draw(gl) {
    const program = gl.createProgram();
    gl.attachShader(program, game.shader.vertex);
    gl.attachShader(program, game.shader.fragment);
    gl.linkProgram(program);

    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      var error = gl.getProgramInfoLog(program);
      console.log('Failed to link program: ' + error);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return null;
    }
    gl.useProgram(program);
    gl.program = program;

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var colorLocation = gl.getUniformLocation(program, "u_color");
    gl.uniform4fv(colorLocation, this.color);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertices.length / 2);
  }
}

class Triangle {
  constructor(width, height, color, x, y, col, row) {
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = x;
    this.y = y;
    this.col = col;
    this.row = row;

    this.vertices = new Float32Array([
      this.x, this.y,
      this.x + this.width, this.y,
      this.x + this.width / 2, this.y + this.height
    ]);
  }

  draw(gl) {
    const program = gl.createProgram();
    gl.attachShader(program, game.shader.vertex);
    gl.attachShader(program, game.shader.fragment);
    gl.linkProgram(program);

    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      var error = gl.getProgramInfoLog(program);
      console.log('Failed to link program: ' + error);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return null;
    }
    gl.useProgram(program);
    gl.program = program;

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var colorLocation = gl.getUniformLocation(program, "u_color");
    gl.uniform4fv(colorLocation, this.color);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
  }

  moveUp() {
    if (this.row - 1 < 0) {
      return;
    }
    const cell = game.data[this.row - 1][this.col];
    if (cell === 0) {
      return;
    }
    if (this.row - 1 === 4 && this.col === 4) {
      return;
    }
    if (this.row - 1 === 5 && this.col === 4) {
      return;
    }
    game.data[this.row][this.col] = -1;
    this.row -= 1;
    collision(this.col, this.row);
  }

  moveDown() {
    if (this.row + 1 > 9) {
      return;
    }
    if (this.row + 1 === 4 && this.col === 4) {
      return;
    }
    if (this.row + 1 === 5 && this.col === 4) {
      return;
    }
    const cell = game.data[this.row + 1][this.col];
    if (cell === 0) {
      return;
    }
    game.data[this.row][this.col] = -1;
    this.row += 1;
    collision(this.col, this.row);
  }

  moveLeft() {
    if (this.col + 1 > 8) {
      return;
    }
    if (this.row === 4 && this.col + 1 === 4) {
      return;
    }
    if (this.row === 5 && this.col + 1 === 4) {
      return;
    }
    const cell = game.data[this.row][this.col + 1];
    if (cell === 0) {
      return;
    }
    game.data[this.row][this.col] = -1;
    this.col += 1;
    collision(this.col, this.row);
  }

  moveRight() {
    if (this.col - 1 < 0) {
      return;
    }
    if (this.row === 4 && this.col - 1 === 4) {
      return;
    }
    if (this.row === 5 && this.col - 1 === 4) {
      return;
    }
    const cell = game.data[this.row][this.col - 1];
    if (cell === 0) {
      return;
    }
    game.data[this.row][this.col] = -1;
    this.col -= 1;
    collision(this.col, this.row);
  }
}

function collision(col, row) {
  const cell = game.data[row][col];

  if (cell === 0) {
    return;
  }
  // end with ghosts
  if (cell === 2 || cell === 3) {
    game.score -= 500;
    // reset
    if (cell === 2) {
      game.data[4][4] = 2;
      game.data[row][col] = 9;
    }
    if (cell === 3) {
      game.data[5][4] = 3;
      game.data[row][col] = 9;
    }
    if (game.score <= 0) {
      game.state = "over";
      return;
    }
  }
  if (cell === 1) {
    game.data[row][col] = 9;
    game.score += 100;
  }
  if (cell === -1) {
    game.data[row][col] = 9;
  }
}

function loadShaderFile(url) {
  return fetch(url).then(response => response.text());
}

async function getShader() {
  const shaderURLs = [
    './shader/main.vert',
    './shader/main.frag'
  ];

  const shader_files = await Promise.all(shaderURLs.map(loadShaderFile));

  const vs_source = shader_files[0];
  const fs_source = shader_files[1];

  const vertexShader = game.gl.createShader(game.gl.VERTEX_SHADER);
  game.gl.shaderSource( vertexShader, vs_source );
  game.gl.compileShader( vertexShader );

  var compiled = game.gl.getShaderParameter(vertexShader, game.gl.COMPILE_STATUS);
  if (!compiled) {
      var error = game.gl.getShaderInfoLog(vertexShader);
      console.log('Failed to compile shader: ' + error);
      return null;
  }

  const fragmentShader = game.gl.createShader(game.gl.FRAGMENT_SHADER);
  game.gl.shaderSource( fragmentShader, fs_source );
  game.gl.compileShader( fragmentShader );

  game.shader.vertex = vertexShader;
  game.shader.fragment = fragmentShader;
}


// canvas
game.canvas = document.getElementById('pacman');

game.canvas.width = game.canvas.clientWidth;
game.canvas.height = game.canvas.clientHeight;

// webgl
game.gl = game.canvas.getContext('webgl2');

await getShader();

// origin -> copy from game data
const origin = JSON.parse(JSON.stringify(game.data));
game.origin = origin;

function drawBlock() {
  const a1 = new Square(0.04, 0.02, [0, 0, 1, 1], 0.05, 0.2);
  a1.draw(game.gl);

  const a4 = new Square(0.04, 0.02, [0, 0, 1, 1], 0.1, 0.2);
  a4.draw(game.gl);

  const a2 = new Square(0.04, 0.02, [0, 0, 1, 1], 0, 0.2);
  a2.draw(game.gl);

  const a3 = new Square(0.04, 0.02, [0, 0, 1, 1], -0.05, 0.2);
  a3.draw(game.gl);

  const a6 = new Square(0.04, 0.02, [0, 0, 1, 1], -0.1, 0.2);
  a6.draw(game.gl);

  const a7 = new Square(0.04, 0.02, [0, 0, 1, 1], 0.05, -0.2);
  a7.draw(game.gl);

  const a8 = new Square(0.04, 0.02, [0, 0, 1, 1], 0.1, -0.2);
  a8.draw(game.gl);

  const a9 = new Square(0.04, 0.02, [0, 0, 1, 1], 0, -0.2);
  a9.draw(game.gl);

  const a10 = new Square(0.04, 0.02, [0, 0, 1, 1], -0.05, -0.2);
  a10.draw(game.gl);

  const a11 = new Square(0.04, 0.02, [0, 0, 1, 1], -0.1, -0.2);
  a11.draw(game.gl);


  const a12 = new Square(0.02, 0.04, [0, 0, 1, 1], 0.11, 0.05);
  a12.draw(game.gl);

  const a13 = new Square(0.02, 0.04, [0, 0, 1, 1], 0.11, 0.1);
  a13.draw(game.gl);

  const a14 = new Square(0.02, 0.04, [0, 0, 1, 1], 0.11, 0);
  a14.draw(game.gl);

  const a15 = new Square(0.02, 0.04, [0, 0, 1, 1], 0.11, -0.05);
  a15.draw(game.gl);

  const a16 = new Square(0.02, 0.04, [0, 0, 1, 1], 0.11, -0.1);
  a16.draw(game.gl);

  const a25 = new Square(0.02, 0.04, [0, 0, 1, 1], 0.11, -0.15);
  a25.draw(game.gl);

  const a17 = new Square(0.02, 0.04, [0, 0, 1, 1], -0.11, 0.05);
  a17.draw(game.gl);

  const a18 = new Square(0.02, 0.04, [0, 0, 1, 1], -0.11, 0.1);
  a18.draw(game.gl);

  const a19 = new Square(0.02, 0.04, [0, 0, 1, 1], -0.11, 0);
  a19.draw(game.gl);

  const a20 = new Square(0.02, 0.04, [0, 0, 1, 1], -0.11, -0.05);
  a20.draw(game.gl);

  const a21 = new Square(0.02, 0.04, [0, 0, 1, 1], -0.11, -0.1);
  a21.draw(game.gl);

  const a24 = new Square(0.02, 0.04, [0, 0, 1, 1], -0.11, -0.15);
  a24.draw(game.gl);

  const a22 = new Square(0.02, 0.04, [0, 0, 1, 1], 0.11, 0.15);
  a22.draw(game.gl);

  const a23 = new Square(0.02, 0.04, [0, 0, 1, 1], -0.11, 0.15);
  a23.draw(game.gl);
}

function draw() {
  game.gl.clearColor(0.8, 0.8, 0.8, 1.0);
  game.gl.clear(game.gl.COLOR_BUFFER_BIT);
  // ========================================
  // draw
  game.data.forEach((rows, row) => {
    rows.forEach(async (type, col) => {
      if (type === 0) { // wall
        const square = new Square(0.2, 0.2, [0, 1, 0, 1], 0.7 - col * 0.2, 0.8 - row * 0.2, col, row);
        square.draw(game.gl);
      }
      if (type === 1) { // pea
        const circle = new Circle(0.015, [1, 1, 0, 1], 0.8 - col * 0.2, 0.9 - row * 0.2, col, row);
        circle.draw(game.gl);
      }
      if (type === 2) { // ghost
        const square = new Square(0.1, 0.1, [1, 0, 0, 1], 0.75 - col * 0.2, 0.85 - row * 0.2, col, row);
        square.draw(game.gl);
        game.enemy1 = square;
      }
      if (type === 3) { // ghost
        const square = new Square(0.1, 0.1, [0, 1, 1, 1], 0.75 - col * 0.2, 0.85 - row * 0.2, col, row);
        square.draw(game.gl);
        game.enemy2 = square;
      }
      if (type === 9) { // hero
        const triangle = new Triangle(0.1, 0.1, [0, 0, 1, 1], 0.75 - col * 0.2, 0.85 - row * 0.2, col, row);
        triangle.draw(game.gl);
        game.hero = triangle;
      }
    });
  });
}

function render() {
  document.getElementById("state").innerText = game.state;
  document.getElementById("time").innerText = game.time;
  document.getElementById("score").innerText = game.score;
}

function initialEvents() {
  document.addEventListener('keydown', (event) => {
    if (event.key === "ArrowUp") {
      if (game.state === "playing") {
        game.hero.moveUp();
      }
    }
    if (event.key === "ArrowDown") {
      if (game.state === "playing") {
        game.hero.moveDown();
      }
    }
    if (event.key === "ArrowLeft") {
      if (game.state === "playing") {
        game.hero.moveLeft();
      }
    }
    if (event.key === "ArrowRight") {
      if (game.state === "playing") {
        game.hero.moveRight();
      }
    }
    if (event.key === "s") { // start game
      if (game.state === "initial") {
        game.state = "playing";
      }
    }
    if (event.key === "p") { // pause game
      if (game.state === "playing") {
        game.state = "pause";
      }
    }
    if (event.code === "KeyR" && event.shiftKey) { // restart game
      if (game.state === "playing" || game.state === "pause" || game.state === "over") {
        game.state = "initial";
        game.data = JSON.parse(JSON.stringify(origin));
        game.time = 60;
        game.score = 0;
      }
    }
    if (event.key === "r") { // resume game
      if (game.state === "pause") {
        game.state = "playing";
      }
    }
  });
}

function loop(timestamp) {
  // all dots are eaten
  var length = 0;
  game.data.forEach(rows => {
    length += rows.filter(col => col === 1).length;
  });
  if (length === 0 && game.state === "playing") {
    game.state = "over";
    game.score += game.time * 100;
  }
  // time over
  game.lastTime = game.lastTime || timestamp;
  if (timestamp - game.lastTime > 1000) {
    game.lastTime = timestamp;
    if (game.state === "playing") {
      game.enemy1.aiMove1(2);
      game.enemy2.aiMove2(3);
    }
    if (game.state === "playing") {
      game.time--;
      if (game.time === 0) {
        game.state = "over";
        game.score += game.time * 100;
      }
    }
  } else if (timestamp - game.lastTime > 500) {
    draw();
    render();
    drawBlock();
  }
  requestAnimationFrame(loop);
}

loop();
initialEvents();
