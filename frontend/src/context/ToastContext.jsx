import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
const Ctx = createContext(null);
export const useToast = () => useContext(Ctx);
export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Math.random();
    setList((l) => [...l, { id, message, type }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 4000);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" role="status" aria-live="polite">
        {list.map((t) => (
          <div key={t.id} className="card flex items-start gap-3 p-3 text-sm">
            {t.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-em-600" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />}
            <span>{t.message}</span>
          </div>))}
      </div>
    </Ctx.Provider>);
}
