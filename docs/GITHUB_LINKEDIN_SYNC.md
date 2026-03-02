# GitHub + LinkedIn Sync

## 1) Sync project to GitHub

```bash
cd /Users/manojreddy/Downloads/smart-exam-scheduler
chmod +x scripts/sync_github.sh scripts/share_linkedin.sh
./scripts/sync_github.sh https://github.com/<your-username>/<your-repo>.git
```

Notes:
- Script auto-removes `node_modules`, `build`, and `dist` from git index if they were added.
- It commits all pending changes and pushes the current branch.

## 2) Share project update to LinkedIn

```bash
./scripts/share_linkedin.sh https://github.com/<your-username>/<your-repo>
```

Optional custom post text:

```bash
./scripts/share_linkedin.sh https://github.com/<your-username>/<your-repo> "Deployed Smart Exam Scheduler with live sync and admin auth."
```
