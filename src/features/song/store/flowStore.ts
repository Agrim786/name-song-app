import { create } from "zustand";
import { type FlowEvent, type Phase, initialPhase, transition } from "../flow";

// In-memory screen state. Only send() changes it, and only through transition(),
// so the screen can never land in a state the machine does not allow.
interface FlowState {
  phase: Phase;
  send: (event: FlowEvent) => void;
}

export const useFlowStore = create<FlowState>((set) => ({
  phase: initialPhase,
  send: (event) => set((s) => ({ phase: transition(s.phase, event) })),
}));
