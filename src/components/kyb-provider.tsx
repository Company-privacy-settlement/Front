"use client";
import { createContext, useContext, useState, type ReactNode } from 'react';
import { emptyKybDraft, kybPacket, type KybDraft } from '@/lib/kyb';

type State = { draft: KybDraft; acknowledged: boolean; preparedAt: string | null };
type KybContext = State & { edit: (fn: (d: KybDraft) => KybDraft) => void; acknowledge: (v: boolean) => void; prepare: () => void };
const Context = createContext<KybContext | null>(null);
export function KybProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => ({ draft: emptyKybDraft(), acknowledged: false, preparedAt: null }));
  function edit(fn: (d: KybDraft) => KybDraft) { setState(s => ({ draft: fn(s.draft), acknowledged: false, preparedAt: null })); }
  function acknowledge(v: boolean) { setState(s => ({ ...s, acknowledged: v, preparedAt: v ? s.preparedAt : null })); }
  function prepare() {
    if (!state.acknowledged) throw new Error('Confirm your authority and review the draft first.');
    const preparedAt = new Date().toISOString();
    kybPacket(state.draft, preparedAt);
    setState(s => ({ ...s, preparedAt }));
  }
  return <Context.Provider value={{ ...state, edit, acknowledge, prepare }}>{children}</Context.Provider>;
}
export function useKyb() { const value = useContext(Context); if (!value) throw new Error('KYB workspace is missing'); return value; }
