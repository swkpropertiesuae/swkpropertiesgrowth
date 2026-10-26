import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateROI,
  mayApprove,
  approvalRole,
  csvCell,
} from "../src/domain.mjs";
test("ROI uses net rent without making an appreciation assumption", () => {
  assert.deepEqual(calculateROI(1500000, 100000, 20000), {
    gross: (100000 / 1500000) * 100,
    net: (80000 / 1500000) * 100,
    cashflow: 80000,
  });
  assert.equal(calculateROI(1000000, 10000, 20000).net, -1);
});
test("ROI rejects missing, negative and non-finite input", () => {
  for (const args of [
    [0, 1, 1],
    [-1, 1, 1],
    [100, -1, 0],
    [100, 1, -1],
    [NaN, 1, 0],
    [100, Infinity, 0],
  ])
    assert.equal(calculateROI(...args), null);
});
test("approval permissions do not allow lower-role escalation", () => {
  assert.equal(mayApprove("Agent", 1), false);
  assert.equal(mayApprove("IT Admin", 3), false);
  assert.equal(mayApprove("BDM", 2), false);
  assert.equal(mayApprove("BDM", 1), true);
  assert.equal(mayApprove("Manager", 2), true);
  assert.equal(mayApprove("Manager", 3), false);
  assert.equal(mayApprove("Owner", 3), true);
  assert.equal(approvalRole(3), "Owner");
});
test("CSV safely quotes text and neutralises spreadsheet formulas", () => {
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
  assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(csvCell("Normal"), '"Normal"');
});
