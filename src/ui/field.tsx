import { createContext, useContext } from "react";
import { type Field, paper } from "./theme";

// The current palette. Text and buttons read their colours from it, so a future
// theme (e.g. dark mode) is one provider value, not a hunt through components.
const FieldContext = createContext<Field>(paper);

export const FieldProvider = FieldContext.Provider;
export const useField = () => useContext(FieldContext);
