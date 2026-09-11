"""Remember-job poll delay (WALM-623). Parity with TS pollingDelayMs."""

from __future__ import annotations

import pytest

from memwal.client import _polling_delay_ms


def test_poll_interval_ms_non_positive_is_no_wait() -> None:
    assert _polling_delay_ms(0, 0) == 0
    assert _polling_delay_ms(0, 15) == 0
    assert _polling_delay_ms(-1, 3) == 0


def test_first_poll_is_immediate() -> None:
    assert _polling_delay_ms(1500, 0) == 0
    assert _polling_delay_ms(5000, 0) == 0


def test_later_polls_cap_at_1_5s_after_20s_pending(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("memwal.client.random.random", lambda: 1.0)
    for attempt in (1, 6, 15, 20):
        delay = _polling_delay_ms(1500, attempt)
        assert delay <= 2000
        assert delay == 1875
    assert _polling_delay_ms(5000, 15) == 1875
