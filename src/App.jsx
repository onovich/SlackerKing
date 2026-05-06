import { useEffect } from 'react';
import { useGameSession } from './logic/hooks/useGameSession';
import { isMorningChoiceAvailable } from './logic/engine/gameEngine';
import { TopBar } from './view/components/TopBar';
import { LogPanel } from './view/components/LogPanel';
import { MorningScreen } from './view/screens/MorningScreen';
import { AfternoonScreen } from './view/screens/AfternoonScreen';
import { NightScreen } from './view/screens/NightScreen';
import { GameOverScreen } from './view/screens/GameOverScreen';

function FloatingTexts({ items }) {
  return items.map((item) => (
    <div
      key={item.id}
      className="floating-text"
      style={{ left: `${item.x}px`, top: `${item.y}px`, color: item.color }}
    >
      {item.text}
    </div>
  ));
}

export default function App() {
  const {
    gameState,
    currentEvent,
    floatingTexts,
    damageFlash,
    choiceLocked,
    locationLocked,
    chooseMorningOption,
    chooseLocation,
    endAfternoon,
    nextDay,
    restart,
  } = useGameSession();

  useEffect(() => {
    document.title = 'SlackerKing';
  }, []);

  const choiceAvailability = Object.fromEntries(
    currentEvent.choices.map((choice) => [choice.id, isMorningChoiceAvailable(gameState, choice)]),
  );

  return (
    <div className={`app-shell flex h-screen w-screen flex-col selection:bg-yellow-700 selection:text-white ${damageFlash ? 'damage-flash' : ''}`}>
      <TopBar gameState={gameState} />

      <main className="flex flex-1 overflow-hidden">
        <div className="relative flex flex-1 items-center justify-center overflow-y-auto p-4 md:p-8" id="interaction-area">
          {gameState.isGameOver ? (
            <GameOverScreen gameOver={gameState.gameOver} day={gameState.day} onRestart={restart} />
          ) : null}

          {!gameState.isGameOver && gameState.phase === 'morning' ? (
            <MorningScreen
              event={currentEvent}
              availability={choiceAvailability}
              onChoose={chooseMorningOption}
              locked={choiceLocked}
            />
          ) : null}

          {!gameState.isGameOver && gameState.phase === 'afternoon' ? (
            <AfternoonScreen
              ap={gameState.player.ap}
              onChooseLocation={chooseLocation}
              onEndAfternoon={endAfternoon}
              locked={locationLocked}
            />
          ) : null}

          {!gameState.isGameOver && gameState.phase === 'night' ? (
            <NightScreen summary={gameState.nightSummary} onNextDay={nextDay} />
          ) : null}

          <FloatingTexts items={floatingTexts} />
        </div>

        <LogPanel logs={gameState.logs} />
      </main>
    </div>
  );
}
