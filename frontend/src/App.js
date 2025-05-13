import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { FaCrown, FaUserAstronaut, FaUserNinja } from "react-icons/fa";

const piecePoints = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

const PlayerPanel = ({ player, avatar, captured, points, lead }) => (
  <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-gray-800 relative border border-gray-100">
    <div className="absolute top-2 right-2">
      {lead > 0 && (
        <span className="bg-yellow-300 px-2 py-1 rounded-full text-xs font-bold text-yellow-900 animate-pulse">
          +{lead}
        </span>
      )}
    </div>
    <div className="text-4xl mb-2">{avatar}</div>
    <div className="text-lg font-bold mb-1">{player}</div>
    <div className="flex gap-1 mb-2">
      {captured.map((type, i) => (
        <span key={i} className="text-xl">
          {type === "q" && <FaCrown />}
          {type === "r" && "♜"}
          {type === "b" && "♝"}
          {type === "n" && "♞"}
          {type === "p" && "♟"}
        </span>
      ))}
    </div>
    <div className="bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full font-bold shadow">
      {points} pts
    </div>
  </div>
);

const ErrorToast = ({ message, onClose }) => (
  <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
    <div className="flex items-center p-4 text-base text-red-800 rounded-lg bg-red-50 border border-red-200 shadow-lg">
      <svg className="flex-shrink-0 w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M18 13a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1h14a1 1 0 011 1v6zM9 9v2h2V9H9z" />
      </svg>
      <span className="font-semibold">Invalid move!</span>&nbsp;{message}
      <button onClick={onClose} className="ml-3 text-xl font-bold">&times;</button>
    </div>
    <style>{`
      @keyframes bounce-in { 0% { transform: translateY(100px); opacity: 0; } 80% { transform: translateY(-10px); } 100% { transform: translateY(0); opacity: 1; } }
      .animate-bounce-in { animation: bounce-in 0.6s; }
    `}</style>
  </div>
);

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [gameOver, setGameOver] = useState(null);
  const [checkStatus, setCheckStatus] = useState(false);
  const [capturedWhite, setCapturedWhite] = useState([]);
  const [capturedBlack, setCapturedBlack] = useState([]);
  const pointsWhite = capturedBlack.reduce((sum, p) => sum + (piecePoints[p] || 0), 0);
  const pointsBlack = capturedWhite.reduce((sum, p) => sum + (piecePoints[p] || 0), 0);
  const leadWhite = pointsWhite - pointsBlack;
  const leadBlack = pointsBlack - pointsWhite;
  useEffect(() => {
    let timer;
    if (game.isCheck() && !game.isGameOver()) {
      setCheckStatus(true);
      timer = setTimeout(() => setCheckStatus(false), 2500);
    } else {
      setCheckStatus(false);
    }
    return () => clearTimeout(timer);
  }, [game]);

  useEffect(() => {
    let timer;
    if (error) {
      setShowError(true);
      timer = setTimeout(() => setShowError(false), 4000);
    } else {
      setShowError(false);
    }
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (game.isCheckmate()) {
      setGameOver(game.turn() === "w" ? "Black wins by checkmate!" : "White wins by checkmate!");
    } else if (game.isDraw()) {
      setGameOver("Game drawn!");
    }
  }, [game]);

  const handleMove = (move) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);

      if (result) {
        if (result.captured) {
          const isWhiteMove = result.color === "w";
          const capturedPiece = result.captured;
          if (isWhiteMove) {
            setCapturedBlack(prev => [...prev, capturedPiece]);
          } else {
            setCapturedWhite(prev => [...prev, capturedPiece]);
          }
        }

        setMoveHistory(prev => {
          const newHistory = [...prev];
          if (result.color === "w") {
            newHistory.push({
              number: newHistory.length + 1,
              white: result.san,
              black: null
            });
          } else {
            if (newHistory.length === 0) {
              newHistory.push({
                number: 1,
                white: null,
                black: result.san
              });
            } else {
              const last = newHistory[newHistory.length - 1];
              if (last.black === null) {
                last.black = result.san;
              } else {
                newHistory.push({
                  number: newHistory.length + 1,
                  white: null,
                  black: result.san
                });
              }
            }
          }
          return newHistory;
        });

        setGame(gameCopy);
        setError("");
        if (gameCopy.isCheckmate()) {
          setGameOver(gameCopy.turn() === "w" ? "Black wins by checkmate!" : "White wins by checkmate!");
        } else if (gameCopy.isDraw()) {
          setGameOver("Game drawn!");
        }
      } else {
        setError("Invalid move! Please try again.");
      }
    } catch (err) {
      setError("Invalid move! Please try again.");
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setError("");
    setGameOver(null);
    setCheckStatus(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50 flex flex-col items-center py-8 px-2">
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl text-center shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">{gameOver}</h2>
            <button
              onClick={resetGame}
              className="bg-yellow-300 text-yellow-900 px-6 py-2 rounded-lg font-bold hover:scale-105 transition"
            >
              New Game
            </button>
          </div>
        </div>
      )}
      {checkStatus && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-3 rounded-lg shadow-lg animate-bounce font-bold text-lg z-50">
          Check!
        </div>
      )}

      <h1 className="text-4xl font-extrabold text-blue-700 mb-6 text-center">
        Handless Chess
      </h1>

      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
        <PlayerPanel
          player="Player 1 (White)"
          avatar={<FaUserAstronaut />}
          captured={capturedBlack}
          points={pointsWhite}
          lead={leadWhite}
        />
        <div className="md:col-span-2 flex flex-col items-center">
          <div className="bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center relative border border-gray-100">
            <Chessboard
              position={game.fen()}
              onPieceDrop={(from, to) => {
                handleMove({ from, to, promotion: "q" });
                return true;
              }}
              animationDuration={350}
              boardWidth={window.innerWidth < 600 ? 320 : 480}
              customBoardStyle={{
                borderRadius: "18px",
                boxShadow: "0 8px 36px 0 rgba(59,7,100,0.10)"
              }}
              showBoardNotation
            />
            <div className="flex gap-4 mt-6">
              <button
                className="bg-yellow-300 text-yellow-900 px-4 py-2 rounded-xl font-bold shadow hover:scale-105 transition"
                onClick={resetGame}
              >
                New Game
              </button>
              <div className="text-lg font-bold text-blue-700 flex items-center gap-2">
                {game.turn() === "w" ? "White's turn" : "Black's turn"}
                {game.inCheck() && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs ml-2 animate-pulse">Check!</span>
                )}
              </div>
            </div>
          </div>
          <div className="w-full mt-6 bg-white rounded-xl shadow p-4 border border-gray-100">
            <h2 className="text-xl font-bold mb-2 text-blue-700">Moves Played</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-center">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-gray-500">#</th>
                    <th className="px-2 py-1 text-blue-700">White</th>
                    <th className="px-2 py-1 text-gray-700">Black</th>
                  </tr>
                </thead>
                <tbody>
                  {moveHistory.map((move, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-blue-50" : "bg-yellow-50"}>
                      <td className="px-2 py-1 text-gray-400">{move.number}</td>
                      <td className="px-2 py-1 font-mono text-blue-800">{move.white || ""}</td>
                      <td className="px-2 py-1 font-mono text-gray-800">{move.black || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <PlayerPanel
          player="Player 2 (Black)"
          avatar={<FaUserNinja />}
          captured={capturedWhite}
          points={pointsBlack}
          lead={leadBlack}
        />
      </div>
      {showError && <ErrorToast message={error} onClose={() => setShowError(false)} />}
    </div>
  );
}
