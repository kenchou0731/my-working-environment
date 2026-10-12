# Claude 多專案自動化系統 — 規劃筆記

## 背景與目標
- 目前已有單一專案的無人值守流程：`claude-by-crontab.sh` 透過 cron 觸發，
  先用 `usage-check.js` 檢查用量額度，通過才呼叫 `claude -p`，輸出經
  `stream-parser.js` 處理，並由 `usage-state.js` 統一讀寫用量狀態檔。
- 接下來要擴展成「同時管理多個專案」：
  - 每個專案各自一個目錄(repo)，各自的 `CLAUDE.md` 與 `state.json`。
  - 需要在單一 Linux 系統上，用一致的方式管理這些專案的排程、狀態、
    以及本系統自己的共用小工具。

## 系統邊界：與 `~/.claude/` 的關係
- `~/.claude/` 是 Claude Code 本身的設定目錄，不用來放使用者自建的
  orchestration 工具，避免混淆、也避免日後 Claude Code 更新動到這裡。
- 使用者自己的多專案自動化系統(本系統)另外放在系統層級的固定路徑，
  暫定放在 `/var/` 底下(路徑細節見下方，待確認)。

## 中央目錄配置（提案）
建議一個固定的系統目錄，例如：

```
/var/lib/claude-automation/
├── bin/                    # 共用小工具 (.js / .sh)：
│   ├── usage-check.js
│   ├── usage-state.js
│   ├── stream-parser.js
│   ├── statusline.js
│   └── claude-by-crontab.sh
├── docs/                   # 本系統的說明文件（含 git 規則）
│   ├── plan.md             # 本文件
│   └── git-conventions.md  # 待撰寫：自動化 commit 的 git 規則
├── projects.json           # 中央註冊表：{name, path, schedule, enabled, ...}
└── state/                  # 共用執行期狀態
    └── claude-usage.json   # 目前寫死在 /home/mbean/claude-usage.json，
                             # 未來可考慮搬到這裡統一管理
```

路徑名稱 `claude-automation` 只是暫定，可以再討論(例如
`/var/lib/claude-ops`、`/var/lib/claude-fleet` 等)。重點是：
- 放在系統固定位置而非 `~/.claude/`。
- 一個目錄同時裝：共用 bin、文件(含 git 規則)、專案註冊表、共用狀態。

## 權限考量
- `/var/lib/` 底下建立新目錄通常需要 `sudo`。建議：
  1. 用 `sudo mkdir -p /var/lib/claude-automation/{bin,docs,state}` 建好骨架。
  2. `sudo chown -R mbean:mbean /var/lib/claude-automation`，
     之後 cron(以 `mbean` 身份執行)就能直接讀寫，不用每次 sudo。
  3. 目錄權限可設 `750`，避免其他系統使用者讀取(裡面可能有專案路徑、
     API 用量等內部資訊)。

## Git 規則（待正式寫成 `docs/git-conventions.md`）
先記錄討論過的方向，之後步驟再落成文件：
- 自動化產生的 commit 一律進專屬分支（例如 `auto` / `claude/auto`），
  不直接動 `main`；由使用者定期 review 後手動合併。
- commit message 統一前綴（例如 `[auto]`），方便用
  `git log --grep='^\[auto\]'` 篩出機器產生的 commit。

## Review Checkpoint 機制（待實作）
- 每個專案的 `state.json` 加一個欄位，例如 `needs_review: true`。
- `claude-by-crontab.sh` 在檢查用量之後、呼叫 `claude` 之前，
  多一道檢查：若該專案 `needs_review` 為 true 就跳過本輪，
  直到使用者手動清掉這個 flag 為止。

## 排程注意事項（待實作）
- 用量額度是整個帳號共用，多專案同時排程會互搶額度：
  各專案的 cron 時間應該錯開，不要全部排在同一分鐘。
- 每次執行前用 `flock` 避免同一專案的上一輪還沒跑完、下一輪就被觸發。

## 目前開發階段
- 上述所有程式與文件，**現階段仍先留在目前這個工作目錄(本 repo)**，
  當作本系統的原始碼／開發環境。
- 之後才會有一個「部署」步驟，把定案的 `bin/`、`docs/` 內容
  複製或連結到 `/var/lib/claude-automation/`。

## Roadmap
1. **[進行中]** 規劃基礎目錄結構（本文件）。
2. 確認 `/var/lib/...` 的實際路徑名稱與權限，建立骨架目錄。
3. 把 `claude-by-crontab.sh` 泛化成吃「專案路徑」參數，而非寫死單一專案。
4. 制定並寫下 git 規則到 `docs/git-conventions.md`。
5. 實作 `needs_review` 檢查機制。
6. 定案 `projects.json` 的格式，並替多專案安排錯開的 cron 排程。
