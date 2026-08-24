import { describe, it, expect } from "vitest";
import {
  generateSequencePuzzle,
  checkSequenceAnswer,
  type Grade,
} from "@/lib/magic-sequence";

const GRADES: Grade[] = [1, 2, 3, 4];

describe("generateSequencePuzzle", () => {
  it("produces a valid puzzle for every grade with exactly one blank", () => {
    for (const grade of GRADES) {
      for (let i = 0; i < 50; i++) {
        const puzzle = generateSequencePuzzle(grade);
        const blanks = puzzle.terms.filter((t) => t === null).length;
        expect(blanks).toBe(1);
        expect(puzzle.correct).toBeGreaterThanOrEqual(0);
        expect(puzzle.options).toHaveLength(4);
        expect(puzzle.options).toContain(puzzle.correct);
      }
    }
  });

  it("does not repeat the blank value among visible terms", () => {
    for (const grade of GRADES) {
      for (let i = 0; i < 30; i++) {
        const puzzle = generateSequencePuzzle(grade);
        const visible = puzzle.terms.filter((t): t is number => t !== null);
        expect(visible).not.toContain(puzzle.correct);
      }
    }
  });

  it("keeps grade 1 values small and non-negative", () => {
    for (let i = 0; i < 50; i++) {
      const puzzle = generateSequencePuzzle(1);
      puzzle.terms.forEach((t) => {
        if (t !== null) expect(t).toBeLessThanOrEqual(50);
      });
      puzzle.options.forEach((o) => expect(o).toBeGreaterThanOrEqual(0));
    }
  });

  it("follows an arithmetic rule when pattern mentions 'anterior'", () => {
    for (let i = 0; i < 30; i++) {
      const puzzle = generateSequencePuzzle(1);
      // grade 1 is always arithmetic
      const full = [...puzzle.terms];
      const blankIdx = full.findIndex((t) => t === null);
      full[blankIdx] = puzzle.correct;
      const steps = [];
      for (let j = 1; j < full.length; j++) steps.push(full[j]! - full[j - 1]!);
      expect(new Set(steps).size).toBe(1);
      const step = steps[0];
      expect(full[blankIdx - 1]! + step).toBe(puzzle.correct);
    }
  });
});

describe("checkSequenceAnswer", () => {
  it("returns true only for the correct answer", () => {
    const puzzle = generateSequencePuzzle(2);
    expect(checkSequenceAnswer(puzzle, puzzle.correct)).toBe(true);
    const wrong = puzzle.options.find((o) => o !== puzzle.correct)!;
    expect(checkSequenceAnswer(puzzle, wrong)).toBe(false);
  });
});
