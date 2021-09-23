import { useState, useCallback } from 'react';

export default function useTransactionalState(initState = {}) {
  const [currState, setCurrState] = useState(initState);
  const [stagedState, setStagedState] = useState(initState);

  const restore = useCallback(() => {
    const newState = { ...currState };
    setStagedState(newState);
    return newState;
  }, [currState]);

  const commit = useCallback(() => {
    const newState = { ...stagedState };
    setCurrState(newState);
    return newState;
  }, [stagedState]);

  const push = useCallback(
    (state, force) => {
      const newState = {
        ...(force ? {} : stagedState),
        ...state,
      };
      setStagedState(newState);
      return newState;
    },
    [stagedState]
  );

  // Yes it's named after version control, fite me irl
  return {
    staged: stagedState,
    master: currState,
    restore,
    commit,
    push,
  };
}
