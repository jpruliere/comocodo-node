module.exports = {
    name: 'comocodo-session-management',
    register: async (server) => {
        server.register(require('hapi-auth-basic'));

        server.auth.strategy('simple', 'basic', {
            validate: async (request, user) => {
                return {isValid: true, credentials: {name: user}}
            }
        });
    
        server.auth.default('simple');
    }
}
// This plugin should always be registered first, as it sets a default strategy for auth that is not applied retroactively on routes already mapped