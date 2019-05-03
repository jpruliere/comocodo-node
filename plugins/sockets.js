module.exports = {
    name: 'comocodo-sockets-management',
    register: async (server) => {
        await server.register({
            plugin: require('nes'),
            options: {
                onDisconnection: (socket) => {
                    // when the user disconnects, the room management plugin handles the sign off
                    socket.server.methods.ragequits(Object.assign(socket.auth.credentials, {id: socket.id}));
                }
            }
        });

        server.subscription('/room/{room}/updates');

        server.subscription('/room/{room}/users');
    }
};