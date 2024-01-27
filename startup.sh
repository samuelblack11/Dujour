#!/bin/bash

# Launch MongoDB in a new Terminal window. This command is specified in the mongo config file
osascript -e 'tell app "Terminal" to do script "startmongo"'

# Launch React app in a new Terminal window
osascript -e 'tell app "Terminal" to do script "cd /Users/samblack/Desktop/MERN/projects/fleetware && npm start"'

# Start Node server in a new Terminal window
osascript -e 'tell app "Terminal" to do script "cd /Users/samblack/Desktop/MERN/projects/fleetware/server && node server.js"'

# Open Mongo Shell in a new Terminal window
osascript -e 'tell app "Terminal" to do script "mongo"'

# Open a Terminal window for Git operations
osascript -e 'tell app "Terminal" to do script "cd /Users/samblack/Desktop/MERN/projects/fleetware && git status"'
