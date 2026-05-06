import { useEffect, useMemo, useRef, useState } from 'react';
import { getCurrentEvent, initializeGameState, resolveLocationVisit, resolveMorningChoice, startNextDay, transitionState } from '../engine/gameEngine';

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
  const [gameState, setGameState] = useState(() => initializeGameState());
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [damageFlash, setDamageFlash] = useState(false);
  const [choiceLocked, setChoiceLocked] = useState(false);
  const [locationLocked, setLocationLocked] = useState(false);
  const timeoutsRef = useRef([]);

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
    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
  }, []);

  const currentEvent = useMemo(() => getCurrentEvent(gameState), [gameState]);

  const chooseMorningOption = (choiceId, point) => {
    if (choiceLocked || gameState.isGameOver) {
      return;
    }

    const energyCost = currentEvent.choices.find((item) => item.id === choiceId)?.energy ?? 0;

    let result;
    setGameState((current) => {
      result = resolveMorningChoice(current, choiceId);
      return result.state;
    });

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
    if (locationLocked || gameState.isGameOver || gameState.player.ap <= 0) {
      return;
    }

    let result;
    setGameState((current) => {
      result = resolveLocationVisit(current, locationId);
      return result.state;
    });

    if (result?.damage) {
      triggerDamageFlash();
    }

    if (result?.nextStep === 'night') {
      setLocationLocked(true);
    }
    queuePhaseTransition(result?.nextStep, result?.delayMs);
  };

  const endAfternoon = () => {
    if (gameState.isGameOver) {
      return;
    }
    setLocationLocked(false);
    setGameState((current) => transitionState(current, 'night'));
  };

  const nextDay = () => {
    setChoiceLocked(false);
    setLocationLocked(false);
    setGameState((current) => startNextDay(current).state);
  };

  const restart = () => {
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutsRef.current = [];
    setFloatingTexts([]);
    setDamageFlash(false);
    setChoiceLocked(false);
    setLocationLocked(false);
    setGameState(initializeGameState());
  };

  return {
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
  };
}
