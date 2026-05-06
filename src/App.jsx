import { useEffect, useMemo } from 'react';
import { useGameSession } from './logic/hooks/useGameSession';
import { isMorningChoiceAvailable } from './logic/engine/gameEngine';
import { locations } from './data/gameContent';
import { TopBar } from './view/components/TopBar';
import { DesktopCompanion } from './view/components/DesktopCompanion';
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

  const choiceAvailability = useMemo(
    () => Object.fromEntries(
      currentEvent.choices.map((choice) => [choice.id, isMorningChoiceAvailable(gameState, choice)]),
    ),
    [currentEvent.choices, gameState],
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const targetTag = event.target?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || event.target?.isContentEditable) {
        return;
      }

      if (gameState.isGameOver) {
        if (event.key.toLowerCase() === 'r') {
          event.preventDefault();
          restart();
        }
        return;
      }

      if (gameState.phase === 'morning') {
        const index = Number(event.key) - 1;
        if (Number.isInteger(index) && index >= 0 && index < currentEvent.choices.length) {
          const choice = currentEvent.choices[index];
          if (choiceAvailability[choice.id]) {
            event.preventDefault();
            chooseMorningOption(choice.id);
          }
        }
        return;
      }

      if (gameState.phase === 'afternoon') {
        if (event.key === 'Enter') {
          event.preventDefault();
          endAfternoon();
          return;
        }

        const index = Number(event.key) - 1;
        if (Number.isInteger(index) && index >= 0 && index < locations.length) {
          event.preventDefault();
          chooseLocation(locations[index].id);
        }
        return;
      }

      if (gameState.phase === 'night' && event.key === 'Enter') {
        event.preventDefault();
        nextDay();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [choiceAvailability, chooseLocation, chooseMorningOption, currentEvent.choices, endAfternoon, gameState.isGameOver, gameState.phase, nextDay, restart]);

  return (
    <div className={`app-shell flex h-screen w-screen flex-col selection:bg-yellow-700 selection:text-white ${damageFlash ? 'damage-flash' : ''}`}>
      <div className="flex h-full w-full flex-col xl:mx-auto xl:max-w-[1720px] xl:px-5 xl:py-4">
        <TopBar gameState={gameState} />

        <main className="flex flex-1 overflow-hidden xl:gap-5 xl:overflow-visible xl:pt-4">
          <DesktopCompanion gameState={gameState} currentEvent={currentEvent} />

          <div
            className="relative flex flex-1 items-center justify-center overflow-y-auto p-4 md:p-8 xl:rounded-[28px] xl:border xl:border-gray-700/80 xl:bg-[radial-gradient(circle_at_top,_rgba(74,85,104,0.28),_rgba(18,20,26,0.95)_55%)] xl:shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
            id="interaction-area"
          >
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
    </div>
  );
}
