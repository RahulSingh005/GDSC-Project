const { Chess } = require('chess.js');
const socketIO = require('socket.io');

class ChessServer {
  constructor(server) {
    this.io = socketIO(server);
    this.games = new Map();
    
    this.io.on('connection', (socket) => {
      socket.on('joinGame', (gameId) => {
        if (!this.games.has(gameId)) {
          this.games.set(gameId, {
            game: new Chess(),
            whiteTime: 300,
            blackTime: 300,
            timer: null,
            turn: 'w'
          });
        }
        socket.join(gameId);
        this.updateClientState(gameId);
      });

      socket.on('makeMove', (gameId, move) => {
        const game = this.games.get(gameId);
        if (game && !game.game.isGameOver()) {
          try {
            game.game.move(move);
            this.updateClientState(gameId);
            this.switchTurn(gameId);
          } catch (e) {
            socket.emit('invalidMove', move);
          }
        }
      });

      socket.on('resetGame', (gameId) => {
        const game = this.games.get(gameId);
        if (game) {
          game.game.reset();
          game.whiteTime = 300;
          game.blackTime = 300;
          game.turn = 'w';
          this.updateClientState(gameId);
        }
      });
    });
  }

  updateClientState(gameId) {
    const game = this.games.get(gameId);
    this.io.to(gameId).emit('gameState', {
      fen: game.game.fen(),
      whiteTime: game.whiteTime,
      blackTime: game.blackTime,
      turn: game.turn
    });
  }

  switchTurn(gameId) {
    const game = this.games.get(gameId);
    game.turn = game.turn === 'w' ? 'b' : 'w';
    this.startTimer(gameId);
  }

  startTimer(gameId) {
    const game = this.games.get(gameId);
    if (game.timer) clearInterval(game.timer);
    
    game.timer = setInterval(() => {
      if (game.turn === 'w') {
        game.whiteTime--;
      } else {
        game.blackTime--;
      }
      
      if (game.whiteTime <= 0 || game.blackTime <= 0) {
        this.io.to(gameId).emit('gameOver', {
          winner: game.whiteTime <= 0 ? 'black' : 'white'
        });
        clearInterval(game.timer);
      }
      
      this.updateClientState(gameId);
    }, 1000);
  }
}

module.exports = ChessServer;
