function GameManager(InputManager, Actuator, StorageManager) {
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager;
  this.actuator       = new Actuator;
  var stylesheetToInsert = document.createElement('style');  
  document.getElementsByTagName('head')[0].appendChild(stylesheetToInsert);
  this.insertedStylesheet = document.styleSheets[document.styleSheets.length - 1];
  this.gridContainer = document.getElementById("grid-container");
  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
  
  this.setup();

}

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  return this.over || (this.won && !this.keepPlaying);
};

// Create the grid
GameManager.prototype.createGrid = function (dim) {
while (this.gridContainer.firstChild) {
    this.gridContainer.removeChild(this.gridContainer.firstChild);
}
//this.insertedStylesheet.empty();
var size           = Math.max(dim.x, dim.y);
var cellMargin = 500/(97/12 * size + 1);
var cellSize = 500/(size * 97/85 + 12/85);
var cellMarginMobile = 2840/(97/12 * size + 1);
var cellSizeMobile = 280/(size * 97/85 + 12/85);
  var row;
  var cell;
  var x = 0;
	for (y = 0; y < dim.y; y++) {
		row = document.createElement("div");
		row.classList.add("grid-row");
		for (x = 0; x < dim.x; x++) {
			cell = document.createElement("div");
			// cell.textContent = x + "|" + y;
			cell.classList.add("grid-cell");
			row.appendChild(cell);

this.insertedStylesheet.insertRule(".tile.tile-position-" + (x+1) + "-" + (y+1) + "{-webkit-transform: translate(" + x * cellSize + "px, " + y * cellSize + "px); -moz-transform: translate(" + x * cellSize + "px, " + y * cellSize + "px); transform: translate(" + x * (cellSize + cellMargin) + "px, " + y * (cellSize + cellMargin) + "px);}", this.insertedStylesheet.cssRules.length);

//mobile
this.insertedStylesheet.insertRule("@media screen and (max-width: 520px) { .tile.tile-position-" + (x+1) + "-" + (y+1) + "{-webkit-transform: translate(" + x * cellSizeMobile + "px, " + y * cellSizeMobile + "px); -moz-transform: translate(" + x * cellSizeMobile + "px, " + y * cellSizeMobile + "px); transform: translate(" + x * (cellSizeMobile + cellMarginMobile) + "px, " + y * (cellSizeMobile + cellMarginMobile) + "px);}}", this.insertedStylesheet.cssRules.length);

		}
		this.gridContainer.appendChild(row);
	}
	

this.insertedStylesheet.insertRule(".grid-cell {width: " + cellSize + "px; height: " + cellSize + "px; margin-right: " + cellMargin + "px;}", this.insertedStylesheet.cssRules.length);
this.insertedStylesheet.insertRule(".tile, .tile .tile-inner {width: " + cellSize + "px; height: " + cellSize + "px; line-height: " + cellSize + "px}", this.insertedStylesheet.cssRules.length);
this.insertedStylesheet.insertRule(".grid-row {margin-bottom: " + cellMargin + "px}", this.insertedStylesheet.cssRules.length);
this.insertedStylesheet.insertRule(".game-container {padding: " + cellMargin + "px}", this.insertedStylesheet.cssRules.length);
this.insertedStylesheet.insertRule(".tile .tile-inner {font-size: " + 220/size + "px; border-radius: " + 12/size + "px;}", this.insertedStylesheet.cssRules.length);

//mobile
this.insertedStylesheet.insertRule("@media screen and (max-width: 520px) { .grid-cell {width: " + cellSizeMobile + "px; height: " + cellSizeMobile + "px; margin-right: " + cellMarginMobile + "px;}}", this.insertedStylesheet.cssRules.length);
this.insertedStylesheet.insertRule("@media screen and (max-width: 520px) { .tile, .tile .tile-inner {width: " + cellSizeMobile + "px; height: " + cellSizeMobile + "px; line-height: " + cellSizeMobile + "px}}", this.insertedStylesheet.cssRules.length);
this.insertedStylesheet.insertRule("@media screen and (max-width: 520px) { .grid-row {margin-bottom: " + cellMarginMobile + "px}}", this.insertedStylesheet.cssRules.length);
this.insertedStylesheet.insertRule("@media screen and (max-width: 520px) { .game-container {padding: " + cellMarginMobile + "px}}", this.insertedStylesheet.cssRules.length);
this.insertedStylesheet.insertRule("@media screen and (max-width: 520px) { .tile .tile-inner {font-size: " + 140/size + "px; border-radius: " + 12/size + "px;}}", this.insertedStylesheet.cssRules.length);
}


// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if (previousState) {
    document.getElementById("xsize").value = previousState.grid.dim.x;
    document.getElementById("ysize").value = previousState.grid.dim.y;
    this.grid        = new Grid({x:previousState.grid.dim.x, y:previousState.grid.dim.y} ,
                                previousState.grid.cells); // Reload grid
    this.createGrid({x:previousState.grid.dim.x, y:previousState.grid.dim.y});
    this.score       = previousState.score;
    this.over        = previousState.over;
    this.won         = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
  } else {
    var x = document.getElementById("xsize").value;
    var y = document.getElementById("ysize").value;
    this.grid        = new Grid({x:x, y:y});
    this.createGrid({x:x, y:y});
    this.score       = 0;
    this.over        = false;
    this.won         = false;
    this.keepPlaying = false;

    // Create the grid

    // Add the initial tiles
    this.addStartTiles();
  }

  // Update the actuator
  this.actuate();
};

GameManager.prototype.addSafeTile = function (position, value) {
	if (this.grid.withinBounds(position)) {
  this.grid.insertTile(new Tile(position, value));
}
}

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  this.addSafeTile({ x: 3, y: 3 }, "I");
  this.addSafeTile({ x: 3, y: 0 }, "D");
  this.addSafeTile({ x: 3, y: 2 }, "D");
  this.addSafeTile({ x: 6, y: 1 }, "D");
  this.addSafeTile({ x: 5, y: 0 }, "S");
  this.addSafeTile({ x: 4, y: 3 }, "S");
  this.addSafeTile({ x: 1, y: 0 }, "E");
  this.addSafeTile({ x: 6, y: 2 }, "E");
  this.addSafeTile({ x: 7, y: 2 }, "E");
  this.addSafeTile({ x: 0, y: 2 }, "E");
  this.addSafeTile({ x: 8, y: 2 }, "E");
  this.addSafeTile({ x: 0, y: 4 }, "E");
  this.addSafeTile({ x: 1, y: 4 }, "E");
  this.addSafeTile({ x: 2, y: 4 }, "E");
  this.addSafeTile({ x: 3, y: 4 }, "E");
  this.addSafeTile({ x: 4, y: 4 }, "E");
  this.addSafeTile({ x: 6, y: 4 }, "E");
  this.addSafeTile({ x: 7, y: 4 }, "E");
  this.addSafeTile({ x: 3, y: 1 }, "E");
  this.addSafeTile({ x: 8, y: 4 }, "Z");
  this.addSafeTile({ x: 0, y: 0 }, "K");
  this.addSafeTile({ x: 0, y: 1 }, "K");
  this.addSafeTile({ x: 0, y: 2 }, "K");
  this.addSafeTile({ x: 0, y: 3 }, "K");
  this.addSafeTile({ x: 1, y: 1 }, "K");
  this.addSafeTile({ x: 1, y: 3 }, "K");
  this.addSafeTile({ x: 0, y: 6 }, "K");
  this.addSafeTile({ x: 0, y: 7 }, "K");
  this.addSafeTile({ x: 0, y: 8 }, "K");
  this.addSafeTile({ x: 1, y: 5 }, "K");
  this.addSafeTile({ x: 1, y: 7 }, "K");
  this.addSafeTile({ x: 1, y: 8 }, "K");
  this.addSafeTile({ x: 6, y: 0 }, "K");
  this.addSafeTile({ x: 7, y: 0 }, "K");
  this.addSafeTile({ x: 8, y: 0 }, "K");
  this.addSafeTile({ x: 7, y: 1 }, "K");
  this.addSafeTile({ x: 8, y: 1 }, "K");
  this.addSafeTile({ x: 5, y: 1 }, "K");
  this.addSafeTile({ x: 2, y: 1 }, "/");
  this.addSafeTile({ x: 1, y: 2 }, "\\");
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  // Clear the state when the game is over (game over only, not win)
  if (this.over) {
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated()
  });

};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying
  };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};


// Drop a tile
GameManager.prototype.dropTile = function (tile) {
 var bottomposition = this.findFarthestPosition(tile, {x:0, y:1});
    this.moveTile(tile, bottomposition.farthest);
};



// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2: down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var dropTraversals = this.buildTraversals({x:0, y:1});
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);
        var step      = self.grid.cellContent(positions.step);
        var stepstep  = self.grid.cellContent(self.findFarthestPosition(positions.step, vector).step);

        // Only one merger per row traversal?
        if (tile.value == "I") {
                var above = self.grid.cellContent({x:cell.x, y:cell.y-1});
		if (step && step.value == "K") {
		  var merged = new Tile(positions.step, "I");
		  merged.mergedFrom = [tile, step];

		  self.grid.insertTile(merged);
		  self.grid.removeTile(tile);

		  // Converge the two tiles' positions
		  tile.updatePosition(positions.step);
		} else if (self.grid.cellAvailable(positions.step)) {
		  self.moveTile(tile, positions.step);
		}
		if (direction == 1 && step && (step.value == "S" || step.value == "D") && self.grid.withinBounds(self.findFarthestPosition(positions.step, vector).step) &&
           self.grid.cellAvailable(self.findFarthestPosition(positions.step, vector).step)) {
			self.moveTile(step, self.findFarthestPosition(positions.step, vector).step);
		  self.moveTile(tile, positions.step);
		}
		if (direction == 3 && step && (step.value == "S" || step.value == "D") && self.grid.withinBounds(self.findFarthestPosition(positions.step, vector).step) &&
           self.grid.cellAvailable(self.findFarthestPosition(positions.step, vector).step)) {
			self.moveTile(step, self.findFarthestPosition(positions.step, vector).step);
		  self.moveTile(tile, positions.step);
		}
	}

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

moved = true;
while (moved) {
	moved = false;
	dropTraversals.y.forEach(function (y) {
		dropTraversals.x.forEach(function (x) {
			cell = { x: x, y: y };
			tile = self.grid.cellContent(cell);
		      if (tile) {
			if (tile.value == "S" || tile.value == "D") {
				self.dropTile(tile);
				if (self.grid.cellContent({x:x, y:y+1}) && self.grid.cellContent({x:x, y:y+1}).value == "/" && !self.grid.cellContent({x:x-1, y:y+1})) {
		    			self.moveTile(tile, {x:x-1, y:y+1});
				}
				if (self.grid.cellContent({x:x, y:y+1}) && self.grid.cellContent({x:x, y:y+1}).value == "\\" && !self.grid.cellContent({x:x+1, y:y+1})) {
		    			self.moveTile(tile, {x:x+1, y:y+1});
				}
			}

			if (tile) {
				if (tile.value == "D" && self.grid.withinBounds({x:tile.x, y:tile.y+1})) {
				var below      = self.grid.cellContent({x:tile.x, y:tile.y+1});
					if (below && below.value=="Z") {
						var merged = new Tile({x:tile.x, y:tile.y+1}, "Z");
						merged.mergedFrom = [tile, self.grid.cellContent({x:tile.x, y:tile.y+1})];
						self.grid.insertTile(merged);
						self.grid.removeTile(tile);
						tile.updatePosition({x:tile.x, y:tile.y+1});
						// Update the score
						self.score += 1;
						if (self.score == 3) {
							self.won = true;
						}
					}
				}
				if (!self.positionsEqual(cell, tile)) {
					moved = true; // The tile moved from its original cell!
				}
			}
}
		});
	  });
}
this.actuate();
};



// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // Up
    1: { x: 1,  y: 0 },  // Right
    2: { x: 0,  y: 1 },  // Down
    3: { x: -1, y: 0 }   // Left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.grid.dim.x; pos++) {
    traversals.x.push(pos);
  }

  for (var pos = 0; pos < this.grid.dim.y; pos++) {
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;
  var stepcell;
  stepcell = { x: (cell.x + vector.x), y: (cell.y + vector.y)};
  if  (!this.grid.withinBounds(stepcell)) {
    stepcell = cell;
  }
  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    step: stepcell,
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.grid.dim.x; x++) {
    for (var y = 0; y < this.grid.dim.y; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
