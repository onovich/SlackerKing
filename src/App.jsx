import { useEffect, useMemo, useState } from 'react';
import { useGameSession } from './logic/hooks/useGameSession';
import { getCourtFigures, getFactionOverview, getRegimeSummary, getVisibleRisks, isMorningChoiceAvailable } from './logic/engine/gameEngine';
import { locations } from './data/gameContent';
import { TopBar } from './view/components/TopBar';
import { DesktopCompanion } from './view/components/DesktopCompanion';
import { LogPanel } from './view/components/LogPanel';
import { MobileActionBar } from './view/components/MobileActionBar';
import { ResumePrompt } from './view/components/ResumePrompt';
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
  const [mobileLogOpen, setMobileLogOpen] = useState(false);
  const {
    gameState,
    runRecords,
    newlyUnlockedMilestones,
    resumePrompt,
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
    continueSavedRun,
    discardSavedRun,
  } = useGameSession();

  useEffect(() => {
    document.title = 'SlackerKing';
  }, []);

  useEffect(() => {
    setMobileLogOpen(false);
  }, [gameState.phase, gameState.isGameOver]);

  const choiceAvailability = useMemo(
    () => Object.fromEntries(
      currentEvent.choices.map((choice) => [choice.id, isMorningChoiceAvailable(gameState, choice)]),
    ),
    [currentEvent.choices, gameState],
  );

  const visibleRisks = useMemo(() => getVisibleRisks(gameState), [gameState]);
  const factionOverview = useMemo(() => getFactionOverview(gameState), [gameState]);
  const courtFigures = useMemo(() => getCourtFigures(gameState, currentEvent), [currentEvent, gameState]);
  const regimeSummary = useMemo(() => getRegimeSummary(gameState, currentEvent), [currentEvent, gameState]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (resumePrompt) {
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
  }, [choiceAvailability, chooseLocation, chooseMorningOption, currentEvent.choices, endAfternoon, gameState.isGameOver, gameState.phase, nextDay, restart, resumePrompt]);

  return (
    <div className={`app-shell relative flex h-screen w-screen flex-col selection:bg-yellow-700 selection:text-white ${damageFlash ? 'damage-flash' : ''}`}>
      <div className="flex h-full w-full flex-col xl:mx-auto xl:max-w-[1720px] xl:px-5 xl:py-4">
        <TopBar gameState={gameState} visibleRisks={visibleRisks} onOpenLog={() => setMobileLogOpen(true)} />

        <main className="flex flex-1 overflow-hidden pb-24 xl:gap-5 xl:overflow-visible xl:pb-0 xl:pt-4">
          <DesktopCompanion gameState={gameState} currentEvent={currentEvent} visibleRisks={visibleRisks} factionOverview={factionOverview} courtFigures={courtFigures} runRecords={runRecords} />

          <div
            className="relative flex flex-1 items-start justify-center overflow-y-auto p-3 pb-28 sm:p-4 sm:pb-32 md:items-center md:p-8 md:pb-8 xl:rounded-[28px] xl:border xl:border-gray-700/80 xl:bg-[radial-gradient(circle_at_top,_rgba(74,85,104,0.28),_rgba(18,20,26,0.95)_55%)] xl:shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
            id="interaction-area"
          >
            {gameState.isGameOver ? (
              <GameOverScreen gameOver={gameState.gameOver} day={gameState.day} runRecords={runRecords} newlyUnlockedMilestones={newlyUnlockedMilestones} onRestart={restart} />
            ) : null}

            {!gameState.isGameOver && gameState.phase === 'morning' ? (
              <MorningScreen
                event={currentEvent}
                availability={choiceAvailability}
                onChoose={chooseMorningOption}
                locked={choiceLocked}
                courtFigures={courtFigures}
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
              <NightScreen summary={gameState.nightSummary} dailyChanges={gameState.dailyChanges} regimeSummary={regimeSummary} onNextDay={nextDay} />
            ) : null}

            <FloatingTexts items={floatingTexts} />
          </div>

          <LogPanel logs={gameState.logs} />
        </main>
      </div>

      {mobileLogOpen ? <LogPanel logs={gameState.logs} variant="mobile" onClose={() => setMobileLogOpen(false)} /> : null}
      {!resumePrompt ? (
        <MobileActionBar
          gameState={gameState}
          currentEvent={currentEvent}
          onOpenLog={() => setMobileLogOpen(true)}
          onEndAfternoon={endAfternoon}
          onNextDay={nextDay}
        />
      ) : null}

      {resumePrompt ? (
        <ResumePrompt
          savedRun={resumePrompt}
          currentEvent={currentEvent}
          onContinue={continueSavedRun}
          onDiscard={discardSavedRun}
        />
      ) : null}
    </div>
  );
}
