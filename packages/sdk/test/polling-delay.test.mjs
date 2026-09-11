import assert from "node:assert/strict";
import test from "node:test";

import { pollingDelayMs } from "../dist/polling-delay.js";

const originalRandom = Math.random;

test.afterEach(() => {
    Math.random = originalRandom;
});

test("pollIntervalMs <= 0 is no wait", () => {
    assert.equal(pollingDelayMs(0, 0), 0);
    assert.equal(pollingDelayMs(0, 15), 0);
    assert.equal(pollingDelayMs(-1, 3), 0);
});

test("first poll is immediate", () => {
    assert.equal(pollingDelayMs(1500, 0), 0);
    assert.equal(pollingDelayMs(5000, 0), 0);
});

test("later polls cap at 1.5s even after ~20s of pending", () => {
    Math.random = () => 1;
    for (const attempt of [1, 6, 15, 20]) {
        const delay = pollingDelayMs(1500, attempt);
        assert.ok(delay <= 2000, `attempt ${attempt} delay ${delay} exceeded 2s cap`);
        assert.equal(delay, 1875);
    }
    assert.equal(pollingDelayMs(5000, 15), 1875);
    assert.equal(pollingDelayMs(400, 1), 500);
    assert.equal(pollingDelayMs(400, 1), pollingDelayMs(400, 20));
});
