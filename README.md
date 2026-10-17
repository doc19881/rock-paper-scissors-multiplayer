# Rock Paper Scissors Multiplayer

A browser version of the C command-line game for two friends. GitHub Pages hosts the game; Firebase syncs room codes and moves.

## Set up Firebase

1. Create a project at https://console.firebase.google.com/ and add a **Web app** in Project settings.
2. Copy the app's web config. Open `firebase-config.js` in this repo and replace its placeholders with Firebase values. Use the Realtime Database URL for `databaseURL`. These values identify the browser app; they are public, not server passwords.
3. In **Build → Authentication → Sign-in method**, enable **Anonymous** sign-in.
4. In **Build → Realtime Database**, create a database. In its **Rules** tab, replace the rules with the contents of `database.rules.json`, then publish. Do not leave the database in open test mode.

## Turn on the game site

GitHub Pages is configured for `main` and the repository root. After the first deployment, the site will be at https://doc19881.github.io/rock-paper-scissors-multiplayer/. If anonymous sign-in is rejected, open Firebase **Authentication → Settings → Authorized domains** and add `doc19881.github.io`.

## Play

Open the site. One person creates a room and shares the six-character code or invite link. The other joins. Both choose a move; the game reveals the result when both have picked. The room creator starts each next round.

## How it works

Firebase Anonymous Auth gives each browser a temporary identity. Realtime Database syncs the room and moves. The creator advances rounds, and each player can write only their own move. A room code acts as an invite; anyone who knows it can read that room's game data. This is for casual play, not ranked games or prizes.
