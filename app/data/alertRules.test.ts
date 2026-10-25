import assert from "node:assert/strict";
import test from "node:test";
import { parseThreshold, thresholdsAreValid } from "./alertRules.ts";

test("a blank threshold is not saved as zero", () => {
  assert.equal(thresholdsAreValid("above", 0, 80), true);
  assert.equal(parseThreshold(""), null);
  assert.equal(parseThreshold("   "), null);
  assert.equal(parseThreshold("0"), 0);
  assert.equal(parseThreshold("80"), 80);
});
