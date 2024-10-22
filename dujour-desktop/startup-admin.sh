#!/bin/bash

# Use Node.js 16
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm use 18

# Set the OpenSSL legacy provider for Node.js 17+
export NODE_OPTIONS=--openssl-legacy-provider

# Launch MongoDB in a new Terminal window. Adjust the path and command as necessary based on your MongoDB installation.
osascript -e 'tell app "Terminal" to do script "startmongo"'
# Alternatively, if using the full command, replace with the correct path to your MongoDB installation.
# osascript -e 'tell app "Terminal" to do script "~/Desktop/MERN/MongoDB/bin/mongod --config ~/Desktop/MERN/MongoDB/mongod.conf"'

# Launch React app for admin dashboard in a new Terminal window
osascript -e 'tell app "Terminal" to do script "cd /Users/samblack/Desktop/MERN/Projects/dujour/dujour-desktop/adminDashboard/client && npm start"'

# Start Node.js server for admin dashboard in a new Terminal window
osascript -e 'tell app "Terminal" to do script "cd /Users/samblack/Desktop/MERN/Projects/dujour/dujour-desktop/adminDashboard/server && node server.js"'

# Open a Terminal window for Git operations, ensuring the path directs to the root of your project
osascript -e 'tell app "Terminal" to do script "cd /Users/samblack/Desktop/MERN/Projects/dujour/dujour-desktop && git status"'
