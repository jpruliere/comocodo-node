module.exports = {
    name: 'comocodo-sockets-management',
    register: async (server) => {
        await server.register(require('nes'));
        server.subscription('/room/{room}');
    }
};