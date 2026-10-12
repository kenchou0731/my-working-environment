#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const USAGE_FILE = '/home/mbean/claude-usage.json';
const EMPTY_USAGE = {
    five_hour: null,
    seven_day: null,
    timestamp: null
};

/**
 * Read usage data from the usage file. If the file does not exist or is invalid, return an empty usage object.
 */
function readUsage() {
    try {
        const raw = fs.readFileSync(USAGE_FILE, 'utf8');
        const data = JSON.parse(raw);
        return {
        five_hour: data.five_hour || null,
        seven_day: data.seven_day || null,
        timestamp: data.timestamp || null,
        };
    } catch (e) {
        return { ...EMPTY_USAGE };
    }
}

/**
 * Write/merge usage data. The windows parameter should only include the intervals to update, e.g., { five_hour: {...} },
 * intervals not specified will retain their existing values in the file, allowing statusLine and stream-parser to share the same file
 * without overwriting each other.
 */
function writeUsage(windows) {
    const current = readUsage();
    const next = {
        five_hour: windows && windows.five_hour !== undefined ? windows.five_hour : current.five_hour,
        seven_day: windows && windows.seven_day !== undefined ? windows.seven_day : current.seven_day,
        timestamp: new Date().toISOString(),
    };

    const dir = path.dirname(USAGE_FILE);
    const tmpFile = path.join(dir, `.${path.basename(USAGE_FILE)}.${process.pid}.${Date.now()}.tmp`);

    try {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(tmpFile, JSON.stringify(next, null, 2));
        fs.renameSync(tmpFile, USAGE_FILE);
        return true;
    } catch (e) {
        try { fs.unlinkSync(tmpFile); } catch (_) { /* ignore */ }
        return false;
    }
}

module.exports = { USAGE_FILE, readUsage, writeUsage };
