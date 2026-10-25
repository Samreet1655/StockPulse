import { useCallback, useEffect, useState } from 'react';
import api, { errorInfo } from '../services/api';
export default function useFetch(url, params) {
  const [state, set] = useState({ data: null, meta: null, loading: true, error: null });
  const key = JSON.stringify(params);
  const load = useCallback(() => {
    set((s) => ({ ...s, loading: true, error: null }));
    let live = true;
    api.get(url, { params: JSON.parse(key || 'null') }).then((r) => live && set({ data: r.data.data, meta: r.data.meta, loading: false, error: null }))
      .catch((e) => live && set({ data: null, meta: null, loading: false, error: errorInfo(e).message }));
    return () => { live = false; };
  }, [url, key]);
  useEffect(() => load(), [load]);
  return { ...state, reload: load };
}
