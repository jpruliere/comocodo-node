module.exports = (server) => {

    server.route({
        method: 'GET',
        path: '/assets/bulma.css',
        handler: {
            file: 'node_modules/bulma/css/bulma.min.css'
        },
        options: {
            auth: false
        }
    });

    server.route({
        method: 'GET',
        path: '/assets/{file*}',
        handler: {
            directory: {
                path: 'public/assets/'
            }
        },
        options: {
            auth: false
        }
    });
};