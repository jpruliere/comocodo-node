const sc = require('./_scripts');

module.exports = (server) => {

    server.route({
        method: 'GET',
        path: '/room/{room}',
        handler: {
            file: 'public/index.html'
        }
    });

    server.route({
        method: 'GET',
        path: '/room/{room}/get',
        handler: (request, h) => {
            
            return sc.load(request.params.room);
           
        }
    });
    
    server.route({
        method: 'POST',
        path: '/room/{room}/update',
        handler: (request, h) => {

            let room = '/room/' + request.params.room;
            sc.save(request.params.room, request.payload);
            server.publish(room, request.payload);
            return h.response().code(204);
            
        }
    });
};