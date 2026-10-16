"use client";

import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { demoReducer, emptyState, readDemoState, storageKey, type DemoAction, type DemoState } from "@/lib/demo-state";

type DemoContextValue = { state: DemoState; ready: boolean; storageError: boolean; dispatch: React.Dispatch<DemoAction> };
const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, emptyState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try { dispatch({ type: "hydrate", state: readDemoState(localStorage.getItem(storageKey)) }); }
    catch { setStorageError(true); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { setStorageError(true); }
  }, [ready, state]);
  return <DemoContext.Provider value={{ state, ready, storageError, dispatch }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}
