# Setup Steps — GitHub Workflow

Follow this in order. Steps 1–5 are done **once**, by Rahul (repo owner).
Steps 6 onward are what **everyone**, including Rahul, repeats every time
they do new work.

---

## Part A — One-time setup (Rahul only)

### 1. Create the repository
- Go to github.com → click **New repository**
- Name it (e.g. `phishing-url-detector`)
- Set it to **Private** (recommended for a group project) or Public, your choice
- Check "Add a README" — or skip this if using the README from this project
- Click **Create repository**

### 2. Clone it to your computer
On your computer, open a terminal in the folder where you want the project, then:
```
git clone https://github.com/your-username/phishing-url-detector.git
cd phishing-url-detector
```

### 3. Create the folder structure
Inside the cloned folder, create:
```
frontend/
backend/
ml/
docs/
```
Put `README.md` at the root, and `API_CONTRACT.md` inside `docs/`.

### 4. Push the initial structure to GitHub
```
git add .
git commit -m "Initial project structure"
git push origin main
```

### 5. Add your teammates as collaborators
- On GitHub, go to your repo → **Settings** → **Collaborators**
- Click **Add people**, enter their GitHub usernames or emails
- They'll get an invite email/notification — they need to accept it before they can push

---

## Part B — Steps for teammates (after being added as a collaborator)

### 6. Accept the invite
Check email or GitHub notifications, click **Accept**.

### 7. Clone the repo to their own computer
```
git clone https://github.com/your-username/phishing-url-detector.git
cd phishing-url-detector
```

### 8. Read the docs first
Before writing any code, open and read:
- `README.md` (project overview, how to run things)
- `docs/API_CONTRACT.md` (exact data shapes to build the frontend against)

---

## Part C — Everyone repeats this for every new piece of work

### 9. Make sure you're up to date before starting
```
git checkout main
git pull origin main
```

### 10. Create a new branch for what you're about to work on
```
git checkout -b short-descriptive-branch-name
```
Examples: `frontend-scan-page`, `backend-scan-route`, `ml-feature-extraction`

### 11. Do the work, then check what changed
```
git status
```
This shows which files you've changed/added — useful to sanity-check before committing.

### 12. Stage and commit your changes
```
git add .
git commit -m "Add scan form with mock data"
```
Write a message that says *what* changed, specifically — not "update" or "fix stuff."

### 13. Push your branch to GitHub
```
git push origin short-descriptive-branch-name
```
First time pushing a new branch, Git might ask you to run the exact command
it suggests (it includes `-u` the first time) — just copy-paste what it shows you.

### 14. Open a Pull Request
- Go to the repo on GitHub — it usually shows a yellow banner: "Compare & pull request." Click it.
- Add a short description of what you did
- Click **Create pull request**

### 15. Review and merge
- Whoever's free (ideally not just the author) skims the changes on the PR page
- If it looks fine, click **Merge pull request** → **Confirm merge**
- Delete the branch after merging (GitHub will offer a button for this) — keeps things tidy

### 16. Go back to step 9 for your next piece of work
Always start fresh from an updated `main` — don't keep building on an old branch
that's already been merged.

---

## If something goes wrong

- **"Merge conflict" when merging a PR:** this means two people edited the exact
  same lines of the exact same file. GitHub will show you both versions —
  don't panic, just decide which lines should stay (or combine them), then
  mark it resolved. This is much rarer if frontend/backend/ml stay in their
  own folders, as set up above.
- **Accidentally committed to `main` directly:** stop, don't push yet. Ask
  Rahul before doing anything further — it's fixable, but easier to fix before
  it's pushed to GitHub.
- **Not sure what branch you're on:** run `git branch` — the one with a `*`
  next to it is your current branch.
