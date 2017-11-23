# tower-defense

Initially, set it up by running:

    npm install
    npm install -g gulp
    cd client
    gulp build

Then run:

    DEBUG=tower-defense-web:* npm start

Note that the server does not yet support auto-reloading, so you will have to restart it manually between changes. `CTRL-C` to stop; the re-run the command.

Use `gulp watch` to automatically update the build when changes are made. (the server must still be restarted)
