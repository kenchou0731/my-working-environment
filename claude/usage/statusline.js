#!/usr/bin/env node
const { writeUsage } = require('./usage-state');

let input = '';
process.stdin.on('data', chunk => (input += chunk));
process.stdin.on('end', () => {
    let data;
    try {
        data = JSON.parse(input);
    } catch (e) {
        process.exit(0);
    }

    const parts = [];
    /* Model name */
    if (data.model && data.model.display_name) {
        parts.push(data.model.display_name);
    }

    /* Workspace directory */
    if (data.workspace && data.workspace.current_dir) {
        const dir = data.workspace.current_dir;
        const home = process.env.HOME;
        parts.push(home && dir.startsWith(home) ? '~' + dir.slice(home.length) : dir);
    }

    /* Usage info */
    const rl = data.rate_limits || {};
    const usagePieces = [];
    if (rl.five_hour && typeof rl.five_hour.used_percentage === 'number') {
        usagePieces.push(`5h:${Math.round(rl.five_hour.used_percentage)}%`);
    }
    if (rl.seven_day && typeof rl.seven_day.used_percentage === 'number') {
        usagePieces.push(`7d:${Math.round(rl.seven_day.used_percentage)}%`);
    }
    if (rl.spend_limit && typeof rl.spend_limit.used_percentage === 'number') {
        usagePieces.push(`spend:${Math.round(rl.spend_limit.used_percentage)}%`);
    }
    if (usagePieces.length > 0) {
        parts.push(usagePieces.join(' '));
    }

    /* Print the status line */
    console.log(parts.join(' | '));

    /* Update usage state */
    const windows = {};
    if (rl.five_hour) {
        windows.five_hour = { used_percentage: rl.five_hour.used_percentage, resets_at: rl.five_hour.resets_at };
    }
    if (rl.seven_day) {
        windows.seven_day = { used_percentage: rl.seven_day.used_percentage, resets_at: rl.seven_day.resets_at };
    }
    if (Object.keys(windows).length > 0) {
        try {
            writeUsage(windows);
        } catch (e) {
            /* Failed silently */
        }
    }
});
