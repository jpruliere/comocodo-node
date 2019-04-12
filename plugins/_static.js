module.exports = (server) => {

    server.route({
        method: 'GET',
        path: '/assets/bulma.css',
        handler: {
            file: 'node_modules/bulma/css/bulma.min.css'
        }
    });

    server.route({
        method: 'GET',
        path: '/assets/{file*}',
        handler: {
            directory: {
                path: 'public/assets/'
            }
        }
    });
};