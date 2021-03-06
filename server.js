'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000
});

const init = async () => {

    await server.register([
        require('./plugins/security'),
        require('./plugins/sockets'),
        require('./plugins/routes'),
        require('./plugins/rooms')
    ]);

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);

};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

module.exports = server;