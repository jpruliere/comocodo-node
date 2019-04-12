module.exports = {
    name: 'comocodo-routes',
    register: async (server) => {
        await server.register(require('inert'));

        require('./_static')(server);
        require('./_api')(server);
    }
}