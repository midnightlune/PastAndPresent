import React, { useState, useEffect } from 'react';

const PastPresent = () => {
  const levels = [
    {
      grid: [
        ['plat', 'plat', 'plat', 'plat', null, null],
        ['plat', null, null, 'plat', null, null],
        ['plat', 'plat', null, 'toggle', null, 'plat'],
        [null, 'plat', 'plat', 'plat', 'gate', 'goal']
      ],
      startPos: { x: 0, y: 0 },
      goalPos: { x: 5, y: 3 },
      pastSpawnIn: 7,
      pastToggle: { x: 3, y: 2 },
      pastgate: { x: 4, y: 3 }
    },
    {
      grid: [
        ['plat', null, null, 'plat', 'plat', 'plat', null],
        ['plat', 'plat', null, 'plat', null, 'gate', 'goal'],
        [null, 'plat', 'plat', 'toggle', 'plat', 'plat', null],
        [null, null, 'plat', 'plat', 'plat', null, null]
      ],
      startPos: { x: 0, y: 0 },
      goalPos: { x: 6, y: 1 },
      pastSpawnIn: 9,
      pastToggle: { x: 3, y: 2 },
      pastgate: { x: 5, y: 1 }
    }
  ];

  const [currentLvl, setcurrentLvl] = useState(0);
  const [gameScreen, setGameScreen] = useState('rules'); // 'rules', 'selectLevel', 'playing'
  const level = levels[currentLvl];

  const [presentPos, setpresentPos] = useState({ ...level.startPos });
  const [moveHistory, setMoveHistory] = useState([]);
  const [pastPos, setpastPos] = useState(null);
  const [pastSteps, setpastSteps] = useState(0);
  const [gameState, setGameState] = useState('playing');
  
  const gateOpen = pastPos && pastPos.x === level.pastToggle.x && pastPos.y === level.pastToggle.y;

  const isValidMove = (pos, futuregateOpen = null) => {
    if (pos.x < 0 || pos.y < 0 || pos.y >= level.grid.length || pos.x >= level.grid[0].length) {
      return false;
    }
    const cell = level.grid[pos.y][pos.x];
    if (cell === null) return false;

    if (cell === 'gate') {
      const gateState = futuregateOpen !== null ? futuregateOpen : gateOpen;
      if (!gateState) return false;
    }
    return true;
  };

  const movePresent = (direction) => {
    if (gameState !== 'playing') return;

    const deltas = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = deltas[direction];
    const newPos = { x: presentPos.x + dx, y: presentPos.y + dy };

    let futuregateOpen = gateOpen;
    if (pastPos && pastSteps < level.pastSpawnIn) {
      const pastDirection = [...moveHistory, direction][pastSteps];
      if (pastDirection) {
        const [pastdx, pastdy] = deltas[pastDirection];
        const newpastPos = { x: pastPos.x + pastdx, y: pastPos.y + pastdy };
        futuregateOpen = newpastPos.x === level.pastToggle.x && newpastPos.y === level.pastToggle.y;
      }
    }

    if (!isValidMove(newPos, futuregateOpen)) return;

    const newHistory = [...moveHistory, direction];
    setMoveHistory(newHistory);
    setpresentPos(newPos);

    // edit 9: collision after button toggle check (>total steps)
    if (pastPos && pastSteps >= level.pastSpawnIn) {
      if (newPos.x === pastPos.x && newPos.y === pastPos.y) {
        setGameState('lost');
        setpastPos(null);
        return;
      }
    }

    if (newHistory.length === level.pastSpawnIn) {
      setpastPos(level.startPos);
      setpastSteps(0);
      
      // edit 7: spawn collision fix 
      if (level.startPos.x === newPos.x && level.startPos.y === newPos.y) {
        setGameState('lost');
        setpastPos(null);
      }
    }

    else if (pastPos && pastSteps < level.pastSpawnIn) {
      const pastDirection = newHistory[pastSteps];
      const [pastdx, pastdy] = deltas[pastDirection];
      const newpastPos = { x: pastPos.x + pastdx, y: pastPos.y + pastdy };
      
      // edit 8: check collission after moving not before 
      const endSamePlat = (newpastPos.x === newPos.x && newpastPos.y === newPos.y);
      const swapCheck = (newpastPos.x === presentPos.x && newpastPos.y === presentPos.y) &&
                                (newPos.x === pastPos.x && newPos.y === pastPos.y);
      
      const collision = endSamePlat || swapCheck;
      
      if (collision) {
        setGameState('lost');
        setpastPos(null);
      } else {
        setpastPos(newpastPos);
        setpastSteps(pastSteps + 1);
      }
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && presentPos.x === level.goalPos.x && presentPos.y === level.goalPos.y) {
      setGameState('win');
    }
  }, [presentPos, level.goalPos, gameState]);

  useEffect(() => {
    const keyCheck = (e) => {
      const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (keys[e.key]) {
        e.preventDefault();
        movePresent(keys[e.key]);
      }
    };
    window.addEventListener('keydown', keyCheck);
    return () => window.removeEventListener('keydown', keyCheck);
  }, [presentPos, gameState, gateOpen, pastPos, pastSteps, moveHistory]);

  const reset = () => {
    setpresentPos({ ...level.startPos });
    setMoveHistory([]);
    setpastPos(null);
    setpastSteps(0);
    setGameState('playing');
  };

  const nextLevel = () => {
    if (currentLvl < levels.length - 1) {
      const nextLvlIndex = currentLvl + 1;
      setcurrentLvl(nextLvlIndex);
      setpresentPos({ ...levels[nextLvlIndex].startPos });
      setMoveHistory([]);
      setpastPos(null);
      setpastSteps(0);
      setGameState('playing');
    }
  };

  const prevLevel = () => {
    if (currentLvl > 0) {
      const prevLvlIndex = currentLvl - 1;
      setcurrentLvl(prevLvlIndex);
      setpresentPos({ ...levels[prevLvlIndex].startPos });
      setMoveHistory([]);
      setpastPos(null);
      setpastSteps(0);
      setGameState('playing');
    }
  };

  const startLevel = (i) => {
    setcurrentLvl(i);
    setpresentPos({ ...levels[i].startPos });
    setMoveHistory([]);
    setpastPos(null);
    setpastSteps(0);
    setGameState('playing');
    setGameScreen('playing');
  };

  // rules
  if (gameScreen === 'rules') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 p-8">
        <div className="max-w-2xl bg-navy-800 rounded-xl p-8 border-4 border-amber-600 shadow-2xl">
          <h1 className="text-5xl font-bold text-scapegoat mb-6 text-center">Past & Present</h1>
          
          <div className="text-navy-200 space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-scapegoat mb-4">How to Play:</h2>
            
            <div className="space-y-3">
              <p className="flex items-start gap-3">
                <span className="text-scapegoat font-bold text-xl">1.</span>
                <span className="text-bluetext">Use Arrow Keys to move your character [Present] across platformss</span>
              </p>
              
              <p className="flex items-start gap-3">
                <span className="text-scapegoat font-bold text-xl">2.</span>
                <span className="text-bluetext">After a certain number of steps, your <strong className="text-red-400">Past</strong> will appear.</span>
              </p>
              
              <p className="flex items-start gap-3">
                <span className="text-scapegoat font-bold text-xl">3.</span>
                <span className="text-bluetext">The Past recreates your <strong>initial moves</strong> prior to its appearance, moving simultaneously with the Present.</span>
              </p>
              
              <p className="flex items-start gap-3">
                <span className="text-scapegoat font-bold text-xl">4.</span>
                <span className="text-bluetext">Only your past can access the <strong className="text-orange-400">orange</strong> button to unlock the Gate.</span>
              </p>
              
              <p className="flex items-start gap-3">
                <span className="text-scapegoat font-bold text-xl">5.</span>
                <span className="text-bluetext">Reach the 🏆<strong className="text-turquoise">Goal</strong> to complete the Level.</span>
              </p>
              
              <p className="flex items-start gap-3">
                <span className="text-red-400 font-bold text-xl">⚠</span>
                <span className="text-betterred"><strong>WARNING:</strong> Your Past Self is also an enemy: You cannot be on the same platform as it!</span>
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button onClick={() => setGameScreen('selectLevel')}
                    className="bg-scapegoat text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transition-colors">
                View All Levels
            </button>
            <button onClick={() => startLevel(0)}
                    className="bg-glitter text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transition-colors">
                Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Level Select
  if (gameScreen === 'selectLevel') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-navy-900 to-navy-500 p-8">
        <div className="max-w-4xl w-full">
          <h1 className="text-4xl font-bold text-bluetext mb-8 text-center">Select a Level</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {levels.map((lvl, index) => {
              return (
                <div key={index}  onClick={() => startLevel(index)}
                      className="bg-navy-800 rounded-xl p-6 border-4 border-navy-700 hover:border-amber-600 transition-colors cursor-pointer">
                  <h2 className="text-2xl font-bold text-scapegoat mb-4">Level {index + 1}</h2>
                  
                  <div className="bg-navy-900 p-4 rounded-lg mb-4">

                    {lvl.grid.map((row, y) => (
                      <div key={y} className="flex justify-center">
                        {row.map((cell, x) => {
                          const isGoal = lvl.goalPos.x === x && lvl.goalPos.y === y;
                          const isToggle = lvl.pastToggle.x === x && lvl.pastToggle.y === y;
                          const isGate = cell === 'gate';
                          
                          return (
                            <div key={x} className="w-8 h-8 m-0.5">
                              {cell !== null && (
                                <div className={`w-full h-full rounded ${
                                  isGate ? 'bg-navy-500' :
                                  isToggle ? 'bg-orange-600' :
                                  isGoal ? 'bg-turquoise' :
                                  'bg-brown'
                                } border border-navy-900`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-bluetext text-sm space-y-1">
                    <p>Grid: {lvl.grid[0].length} × {lvl.grid.length}</p>
                    <p>Past appears after: {lvl.pastSpawnIn} steps</p>
                  </div>
                  
                  <button className="mt-4 w-full bg-scapegoat text-white font-bold py-2 px-4 rounded transition-colors">
                    Play Level {index+1}
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="text-center">
            <button onClick={() => setGameScreen('rules')} className="bg-glitter text-white font-bold py-2 px-6 rounded-lg transition-colors">
              ← Back to Rules
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  const cellSize = 70;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 p-8">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-scapegoat mb-2">Past & Present</h1>
        <p className="text-bluetext">After {level.pastSpawnIn} steps, your Past Self will appear. It will follow your footsteps {level.pastSpawnIn} times.</p>
        <p className="text-bluetext-muted text-sm mt-2">Use arrow keys to move.</p>
        <button onClick={() => setGameScreen('selectLevel')} className="mt-2 text-glitter text-sm underline">
          ← Back to Level Selection
        </button>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="bg-navy-700 px-4 py-2 rounded-lg">
          <span className="text-turquoise font-bold">Level {currentLvl+1}/{levels.length}</span>
          <span className="text-scapegoat ml-3">Steps: {moveHistory.length}</span>
          {pastPos && <span className="text-red-400 ml-3">Past Active!!</span>}
        </div>
        <button onClick={prevLevel} disabled={currentLvl===0} className="bg-navy-600 hover:bg-navy-500 disabled:bg-navy-700 disabled:opacity-50 px-3 py-2 rounded-lg text-white text-sm">
          ← Prev
        </button>
        <button onClick={reset} className="bg-navy-600 hover:bg-navy-500 p-2 rounded-lg">
          🔄
        </button>
        <button onClick={nextLevel} disabled={currentLvl === levels.length - 1} className="bg-navy-600 hover:bg-navy-500 disabled:bg-navy-700 disabled:opacity-50 px-3 py-2 rounded-lg text-white text-sm">
          Next →
        </button>
      </div>

      <div className="relative bg-navy-800 p-4 rounded-xl border-4 border-navy-700">
        {level.grid.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => {
              const isPresent = presentPos.x === x && presentPos.y === y;
              const isPast = pastPos && pastPos.x === x && pastPos.y === y;
              const isGoal = level.goalPos.x === x && level.goalPos.y === y;
              const isToggle = level.pastToggle.x === x && level.pastToggle.y === y;
              const isGate = cell === 'gate';
              
              return (
                <div
                  key={x}
                  className="relative m-0.5"
                  style={{ width: cellSize, height: cellSize }}
                >
                  {cell !== null && (
                    <div className="relative w-full h-full">

                      <div className={`absolute bottom-0 w-full h-4 rounded ${
                        isGate && !gateOpen ? 'bg-navy-400 opacity-40' :
                        isToggle ? 'bg-glitter' :
                        isGoal ? 'bg-turquoise' :
                        'bg-brown'
                        } 
                      border-2 ${
                        isGate && !gateOpen ? 'border-turquoise' :
                        isToggle ? 'border-glitter' :
                        isGoal ? 'border-turquoise' :
                        'border-brown'
                      } shadow-lg`}>
                        

                        {isToggle && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                            <div className={`w-10 h-4 rounded-full ${gateOpen ? 'bg-yellow-400' : 'bg-orange-500'} border-3 border-orange-900 shadow-xl flex items-center justify-center`}>
                              <div className={`w-3 h-2 rounded-full ${gateOpen ? 'bg-yellow-200' : 'bg-orange-300'}`} />
                            </div>
                          </div>
                        )}
                        
                        {isGoal && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                            🏆
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {isPresent && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="relative">
                        {/* CHAR BODY  */}
                        <div className="w-8 h-10 bg-scapegoat rounded-t-full border-2 border-white shadow-xl" />
                        {/* CHAR HEAD */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-scapegoathead rounded-full border-2 border-white" />
                      </div>
                    </div>
                  )}
                  
                  {isPast && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="relative">
                        {/* CHAR BODY */}
                        <div className="w-8 h-10 bg-shadow rounded-t-full border-2 border-scapegoat shadow-xl" />
                        {/* CHAR HEAD */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-shadow rounded-full border-2 border-scapegoat" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {gameState === 'win' && (
        <div className="mt-6 bg-turquoise text-navy-700 px-8 py-4 rounded-lg text-xl font-bold shadow-xl flex items-center gap-3">
          🏆You have escaped your Past.
          {currentLvl < levels.length - 1 && (
            <button onClick={nextLevel} className="ml-4 text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded text-sm">
              Next Level →
            </button>
          )}
        </div>
      )}
      
      {gameState === 'lost' && (
        <div className="mt-6 bg-darkred text-white px-8 py-4 rounded-lg text-xl font-bold shadow-xl flex items-center gap-3">
           ☠️ Your Past caught up to you.
          <button onClick={reset} className="ml-4 bg-betterred px-4 py-2 rounded text-sm">
            Retry
          </button>
        </div>
      )}

      <div className="mt-6 text-center text-bluetext text-sm max-w-md">
        <p>Goal: Reach the trophy.</p>
      </div>
    </div>
  );
};

export default PastPresent;