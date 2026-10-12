#!/usr/bin/env node
'use strict';

/*
 * Usage:
 *   claude -p "..." --output-format stream-json --verbose | node stream-parser.js
 */
const readline = require('readline');
const { writeUsage } = require('./usage-state');

const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on('line', (line) => {
    if (!line.trim()) return;

    let event;
    try {
        event = JSON.parse(line);
    } catch (e) {
        return;
    }

    if (event.type === 'result' && typeof event.result === 'string') {
        process.stdout.write(event.result + '\n');
    }

    if (event.type !== 'rate_limit_event') return;

    const windows = event.rate_limit_info && event.rate_limit_info.unifiedWindows;
    if (!windows) return;

    /* Update usage state */
    const update = {};
    if (windows.five_hour && typeof windows.five_hour.utilization === 'number') {
        update.five_hour = {
        used_percentage: windows.five_hour.utilization * 100,
        resets_at: windows.five_hour.resetsAt,
        };
    }
    if (windows.seven_day && typeof windows.seven_day.utilization === 'number') {
        update.seven_day = {
        used_percentage: windows.seven_day.utilization * 100,
        resets_at: windows.seven_day.resetsAt,
        };
    }
    if (Object.keys(update).length > 0) {
        try {
            writeUsage(update);
        } catch (e) {
            /* Failed silently */
        }
    }
});
