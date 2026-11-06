import { useCallback, useEffect, useReducer, useRef } from "react";
import { flushSync } from "react-dom";
import { generateQuestionBatch } from "@/dataLoader";
import { MAX_MISTAKES, MAX_QUESTIONS } from "@/lib/labels";
import type { GameDirection, GameFormat, GameMode, Question } from "@/types";

export type Screen = "menu" | "loading" | "playing" | "finished" | "error";

export interface RunSettings {
  mode: GameMode;
  format: GameFormat;
  direction: GameDirection;
}

interface GameState {
  screen: Screen;
  run: RunSettings | null;
  questions: Question[];
  index: number;
  selected: string | null;
  score: number;
  mistakes: number;
  answered: number;
  runOver: boolean;
  error: string | null;
}

const initialState: GameState = {
  screen: "menu",
  run: null,
  questions: [],
  index: 0,
  selected: null,
  score: 0,
  mistakes: 0,
  answered: 0,
  runOver: false,
  error: null
};

type Action =
  | { type: "START"; run: RunSettings }
  | { type: "LOADED"; questions: Question[] }
  | { type: "APPENDED"; questions: Question[] }
  | { type: "FAILED"; message: string }
  | { type: "ANSWER"; option: string }
  | { type: "NEXT" }
  | { type: "RETRY" }
  | { type: "MENU" };

/**
 * One rule per transition. Ending a run and labelling the last action both
 * read `runOver`, which is why they can never disagree (the old build said
 * “show score” one question early).
 */
function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START":
      return { ...initialState, run: action.run, screen: "loading" };

    case "RETRY":
      return { ...initialState, run: state.run, screen: "loading" };

    case "LOADED":
      return { ...state, questions: action.questions, index: 0, screen: "playing", error: null };

    case "APPENDED":
      return { ...state, questions: [...state.questions, ...action.questions] };

    case "FAILED":
      return { ...state, screen: "error", error: action.message };

    case "ANSWER": {
      const question = state.questions[state.index];
      if (!question || state.selected !== null) return state;

      const correct = action.option === question.answer;
      const mistakes = state.mistakes + (correct ? 0 : 1);
      const answered = state.answered + 1;
      const runOver =
        state.run?.format === "questions" ? answered >= MAX_QUESTIONS : mistakes >= MAX_MISTAKES;

      return {
        ...state,
        selected: action.option,
        score: state.score + (correct ? 1 : 0),
        mistakes,
        answered,
        runOver
      };
    }

    case "NEXT":
      return state.runOver
        ? { ...state, screen: "finished" }
        : { ...state, index: state.index + 1, selected: null };

    case "MENU":
      return initialState;
  }
}

const BUFFER_AHEAD = 3;

interface ViewTransition {
  finished: Promise<void>;
}

type DocumentWithTransitions = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

/**
 * Swaps the question inside a native view transition when the browser has one.
 * Everything else (including the score strip) swaps instantly, so only the
 * card itself crossfades; reduced-motion users get the plain swap.
 */
function runWithViewTransition(update: () => void): void {
  const doc = document as DocumentWithTransitions;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  if (!doc.startViewTransition || reduced) {
    update();
    return;
  }

  document.documentElement.dataset.viewTransition = "1";

  const transition = doc.startViewTransition(() => flushSync(update));
  void transition.finished.finally(() => {
    delete document.documentElement.dataset.viewTransition;
  });
}

export function useGameRun() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const loading = useRef(false);
  const exhausted = useRef(false);

  const load = useCallback(
    async (run: RunSettings, excludePrompts: string[], append: boolean) => {
      if (loading.current) return;
      loading.current = true;

      try {
        const questions = await generateQuestionBatch({
          mode: run.mode,
          direction: run.direction,
          excludePrompts
        });

        if (questions.length === 0) {
          exhausted.current = true;
        }

        dispatch(append ? { type: "APPENDED", questions } : { type: "LOADED", questions });
      } catch (error) {
        // A failed top-up keeps the current question on screen; only the first
        // load is fatal for the run.
        if (!append) {
          dispatch({
            type: "FAILED",
            message: error instanceof Error ? error.message : "Sorular yüklenemedi."
          });
        }
      } finally {
        loading.current = false;
      }
    },
    []
  );

  useEffect(() => {
    if (state.screen !== "loading" || !state.run) return;
    exhausted.current = false;
    void load(state.run, [], false);
  }, [load, state.run, state.screen]);

  useEffect(() => {
    if (state.screen !== "playing" || !state.run) return;
    if (exhausted.current || state.questions.length - state.index > BUFFER_AHEAD) return;

    void load(
      state.run,
      state.questions.map((question) => question.prompt),
      true
    );
  }, [load, state.index, state.questions, state.run, state.screen]);

  const start = useCallback((run: RunSettings) => dispatch({ type: "START", run }), []);
  const answer = useCallback((option: string) => dispatch({ type: "ANSWER", option }), []);
  const next = useCallback(() => runWithViewTransition(() => dispatch({ type: "NEXT" })), []);
  const retry = useCallback(() => dispatch({ type: "RETRY" }), []);
  const toMenu = useCallback(() => dispatch({ type: "MENU" }), []);

  const question = state.questions[state.index];
  const isCorrect = state.selected === null || !question ? null : state.selected === question.answer;

  return {
    screen: state.screen,
    run: state.run,
    question,
    selected: state.selected,
    isCorrect,
    score: state.score,
    mistakes: state.mistakes,
    answered: state.answered,
    runOver: state.runOver,
    error: state.error,
    questionNumber: state.index + 1,
    start,
    answer,
    next,
    retry,
    toMenu
  };
}
