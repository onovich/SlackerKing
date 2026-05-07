import { useEffect, useMemo, useRef, useState } from 'react';
import { getCurrentEvent, initializeGameState, resolveLocationVisit, resolveMorningChoice, startNextDay, transitionState } from '../engine/gameEngine';
import { clearCurrentRun, loadCurrentRun, saveCurrentRun } from '../storage/currentRun';
import { getNewlyUnlockedArchiveMilestones, loadRunRecords, recordFinishedRun, saveRunRecords } from '../storage/runRecords';

function createFloatingText(text, point, color) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    x: point?.x ?? window.innerWidth / 2,
    y: point?.y ?? window.innerHeight / 2,
    color,
  };
}

export function useGameSession() {
  const initialSavedRun = loadCurrentRun();
  const [gameState, setGameState] = useState(() => initialSavedRun?.gameState ?? initializeGameState());
  const [runRecords, setRunRecords] = useState(() => loadRunRecords());
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [damageFlash, setDamageFlash] = useState(false);
  const [choiceLocked, setChoiceLocked] = useState(false);
  const [locationLocked, setLocationLocked] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(() => initialSavedRun);
  const [newlyUnlockedMilestones, setNewlyUnlockedMilestones] = useState([]);
  const gameStateRef = useRef(gameState);
  const timeoutsRef = useRef([]);
  const recordedRunKeyRef = useRef(null);

  const queueTimeout = (callback, delay) => {
    const timeoutId = window.setTimeout(callback, delay);
    timeoutsRef.current.push(timeoutId);
  };

  const triggerDamageFlash = () => {
    setDamageFlash(true);
    queueTimeout(() => setDamageFlash(false), 500);
  };

  const addFloatingText = (text, point, color) => {
    const item = createFloatingText(text, point, color);
    setFloatingTexts((current) => [...current, item]);
    queueTimeout(() => {
      setFloatingTexts((current) => current.filter((entry) => entry.id !== item.id));
    }, 1500);
  };

  const queuePhaseTransition = (nextStep, delayMs) => {
    if (!nextStep || !delayMs) {
      return;
    }

    queueTimeout(() => {
      setGameState((current) => transitionState(current, nextStep));
      if (nextStep === 'afternoon') {
        setChoiceLocked(false);
      }
      if (nextStep === 'night') {
        setLocationLocked(false);
      }
    }, delayMs);
  };

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (resumePrompt) {
      return;
    }

    if (gameState.isGameOver) {
      clearCurrentRun();
      return;
    }

    saveCurrentRun(gameState);
  }, [gameState, resumePrompt]);

  useEffect(() => {
    if (!gameState.isGameOver || !gameState.gameOver) {
      return;
    }

    const runKey = [
      gameState.day,
      gameState.gameOver.cause,
      gameState.gameOver.regimeSummary?.epithet ?? '',
    ].join(':');

    if (recordedRunKeyRef.current === runKey) {
      return;
    }

    recordedRunKeyRef.current = runKey;
    setRunRecords((current) => {
      const next = recordFinishedRun(current, {
        day: gameState.day,
        cause: gameState.gameOver?.cause,
        isVictory: gameState.gameOver?.isVictory,
        epithet: gameState.gameOver?.regimeSummary?.epithet,
        title: gameState.gameOver?.title,
        routeTitle: gameState.gameOver?.regimeSummary?.title,
        routeBody: gameState.gameOver?.regimeSummary?.body,
        primaryFaction: gameState.gameOver?.regimeSummary?.primaryFaction?.label,
        figures: gameState.gameOver?.regimeSummary?.figures?.map((figure) => figure.displayName ?? figure.name),
      });
      setNewlyUnlockedMilestones(getNewlyUnlockedArchiveMilestones(current, next));
      saveRunRecords(next);
      return next;
    });
  }, [gameState.day, gameState.gameOver, gameState.isGameOver]);

  const currentEvent = useMemo(() => getCurrentEvent(gameState), [gameState]);

  const chooseMorningOption = (choiceId, point) => {
    const currentState = gameStateRef.current;
    if (choiceLocked || currentState.isGameOver) {
      return;
    }

    const energyCost = currentEvent.choices.find((item) => item.id === choiceId)?.energy ?? 0;

    const result = resolveMorningChoice(currentState, choiceId);
    setGameState(result.state);

    if (!result?.nextStep) {
      return;
    }

    setChoiceLocked(true);
    addFloatingText(`-${energyCost}`, point, '#60a5fa');

    if (result?.damage) {
      triggerDamageFlash();
    }
    queuePhaseTransition(result?.nextStep, result?.delayMs);
  };

  const chooseLocation = (locationId) => {
    const currentState = gameStateRef.current;
    if (locationLocked || currentState.isGameOver || currentState.player.ap <= 0) {
      return;
    }

    const result = resolveLocationVisit(currentState, locationId);
    setGameState(result.state);

    if (result?.damage) {
      triggerDamageFlash();
    }

    if (result?.nextStep === 'night') {
      setLocationLocked(true);
    }
    queuePhaseTransition(result?.nextStep, result?.delayMs);
  };

  const endAfternoon = () => {
    const currentState = gameStateRef.current;
    if (currentState.isGameOver) {
      return;
    }
    setLocationLocked(false);
    setGameState(transitionState(currentState, 'night'));
  };

  const nextDay = () => {
    const currentState = gameStateRef.current;
    setChoiceLocked(false);
    setLocationLocked(false);
    setGameState(startNextDay(currentState).state);
  };

  const restart = () => {
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutsRef.current = [];
    recordedRunKeyRef.current = null;
    setFloatingTexts([]);
    setDamageFlash(false);
    setChoiceLocked(false);
    setLocationLocked(false);
    setNewlyUnlockedMilestones([]);
    clearCurrentRun();
    setGameState(initializeGameState());
  };

  const continueSavedRun = () => {
    setResumePrompt(null);
  };

  const discardSavedRun = () => {
    clearCurrentRun();
    recordedRunKeyRef.current = null;
    setFloatingTexts([]);
    setDamageFlash(false);
    setChoiceLocked(false);
    setLocationLocked(false);
    setNewlyUnlockedMilestones([]);
    setGameState(initializeGameState());
    setResumePrompt(null);
  };

  return {
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
  };
}
