import { useCallback, useEffect, useState } from 'react';
import { useMutate } from 'restful-react';

export default function useMutableServerData(config = {}, initState) {
  const { mutate, loading } = useMutate(config);
  const [state, setState] = useState(initState);
  const [error, setError] = useState(null);

  const syncData = useCallback(
    async (params, syncConfig) => {
      try {
        const res = await mutate(params, syncConfig);
        setState(res);
        return res;
      } catch (err) {
        setError(err);
        return null;
      }
    },
    [mutate]
  );

  useEffect(() => {
    if (config.eager) {
      syncData();
    }
  }, [syncData, config.eager]);

  return {
    isLoaded: state !== initState,
    mutate: setState,
    data: state,
    syncData,
    loading,
    error,
  };
}
