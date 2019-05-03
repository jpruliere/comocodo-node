const sc = require('./_scripts');

module.exports = (server) => {

    // enter a room
    server.route({
        method: 'GET',
        path: '/room/{room}',
        handler: {
            file: 'public/index.html'
        },
        options: {
            auth: false
        }
    });

    // get the script
    server.route({
        method: 'GET',
        path: '/room/{room}/get',
        handler: (request, h) => {
            // before getting the script, the user logs themself
            server.methods.enters(Object.assign(request.auth.credentials, {id: request.socket.id}), request.params.room);
            return sc.load(request.params.room);
           
        }
    });

    // update the script
    server.route({
        method: 'POST',
        path: '/room/{room}/update',
        handler: (request, h) => {

            let room = '/room/' + request.params.room;
            sc.save(request.params.room, request.payload);
            server.publish(room + '/updates', request.payload);
            return h.response().code(204);
            
        }
    });
};