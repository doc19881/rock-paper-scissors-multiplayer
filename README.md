# Rock Paper Scissors Multiplayer

A browser version of the C command-line game, adapted for two friends. GitHub Pages hosts the page; Firebase syncs room codes and moves.

## Set up Firebase

1. Create a project at https://console.firebase.google.com/ and add a **Web app** in Project settings.
2. Copy the app's web config. Open `firebase-config.js` in this repo and replace every placeholder with the values from Firebase. Use the Realtime Database URL for `databaseURL`. These browser settings are public identifiers, not server passwords.
3. In **Build → Authentication → Sign-in method**, enable **Anonymous** sign-in.
4. In **Build → Realtime Database**, create a database. In its **Rules** tab, replace the rules with the contents of `database.rules.json`, then publish. Do not leave the database in open test mode.

## Turn on the game site

In this repository, open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/(root)`, then save. GitHub will show the published site link there after deployment.

## Play

Open the site. One person creates a room and shares the six-character code or invite link. The other joins. Both choose a move; the game reveals the result when both have picked. The room creator starts each next round.

## How it works

Firebase Anonymous Auth gives each browser a temporary identity. Realtime Database syncs the room and moves. The creator advances the round, and each player can only write their own move. A room code works like an invite; anyone who knows it can read that room's game data. This is a casual game, not designed for ranked play or prizes.
