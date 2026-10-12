#!/usr/bin/env node
'use strict';

// Check whether current usage passes the automation threshold. Exit 0 if it passes, exit 1 otherwise.
// Rules:
//   - 7-day usage: the allowed threshold depends on how many days remain until resets_at
//     (this reserves a share of quota for personal use as the reset approaches):
//       >= 6 days remaining -> pass if used_percentage < 13%
//       >= 5 days remaining -> pass if used_percentage < 26%
//       >= 4 days remaining -> pass if used_percentage < 39%
//       >= 3 days remaining -> pass if used_percentage < 52%
//       >= 2 days remaining -> pass if used_percentage < 65%
//       >= 1 day remaining  -> pass if used_percentage < 78%
//       < 1 day remaining   -> pass if used_percentage < 90%
//   - 5-hour usage: pass if used_percentage < 50% (reserve 50% for personal use)
//   - If a window's resets_at has already passed, treat it as passed regardless of used_percentage
//   - If there is no usage data at all (e.g. the file doesn't exist yet), treat it as passed so
//     automation isn't blocked before data has been collected

const { readUsage } = require('./usage-state');

const FIVE_HOUR_THRESHOLD_PCT = 50;

const SEVEN_DAY_TIERS = [
    { minDaysRemaining: 6, thresholdPct: 13 },
    { minDaysRemaining: 5, thresholdPct: 26 },
    { minDaysRemaining: 4, thresholdPct: 39 },
    { minDaysRemaining: 3, thresholdPct: 52 },
    { minDaysRemaining: 2, thresholdPct: 65 },
    { minDaysRemaining: 1, thresholdPct: 78 },
    { minDaysRemaining: 0, thresholdPct: 90 },
];

function isExpired(resetsAt) {
    if (typeof resetsAt !== 'number') return false;
    return Date.now() / 1000 >= resetsAt;
}

function sevenDayThreshold(resetsAt) {
    const daysRemaining = (resetsAt - Date.now() / 1000) / 86400;
    const tier = SEVEN_DAY_TIERS.find((t) => daysRemaining >= t.minDaysRemaining);
    return tier.thresholdPct;
}

function checkFiveHour(window) {
    if (!window || typeof window.used_percentage !== 'number') {
        return { ok: true, reason: 'no data' };
    }
    if (isExpired(window.resets_at)) {
        return { ok: true, reason: `reset at ${new Date(window.resets_at * 1000).toISOString()}` };
    }
    return {
        ok: window.used_percentage < FIVE_HOUR_THRESHOLD_PCT,
        reason: `${window.used_percentage.toFixed(1)}% (threshold ${FIVE_HOUR_THRESHOLD_PCT}%)`,
    };
}

function checkSevenDay(window) {
    if (!window || typeof window.used_percentage !== 'number') {
        return { ok: true, reason: 'no data' };
    }
    if (isExpired(window.resets_at)) {
        return { ok: true, reason: `reset at ${new Date(window.resets_at * 1000).toISOString()}` };
    }
    const thresholdPct = sevenDayThreshold(window.resets_at);
    return {
        ok: window.used_percentage < thresholdPct,
        reason: `${window.used_percentage.toFixed(1)}% (threshold ${thresholdPct}%)`,
    };
}

function main() {
    const usage = readUsage();

    const fiveHour = checkFiveHour(usage.five_hour);
    const sevenDay = checkSevenDay(usage.seven_day);

    const pass = fiveHour.ok && sevenDay.ok;

    console.error(`[usage-check] 5h: ${fiveHour.reason} -> ${fiveHour.ok ? 'PASS' : 'BLOCK'}`);
    console.error(`[usage-check] 7d: ${sevenDay.reason} -> ${sevenDay.ok ? 'PASS' : 'BLOCK'}`);

    process.exit(pass ? 0 : 1);
}

main();
