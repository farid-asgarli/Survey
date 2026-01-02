import { useEffect } from 'react';
import { InternalEndpointsModel, useDataContext } from './query-manager';

export function useBindQueryManager<TKey extends keyof InternalEndpointsModel>(key: TKey) {
  const qm = useDataContext(key);

  useEffect(() => {
    qm.fetchIfNotExists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return qm;
}
