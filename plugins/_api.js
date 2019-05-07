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

            // only accept updates from the writer
            if (!server.methods.isWriter(Object.assign(request.auth.credentials, {id: request.socket.id}), request.params.room))
                return h.response().code(403);

            let room = '/room/' + request.params.room;
            sc.save(request.params.room, request.payload);
            server.publish(room + '/updates', request.payload);
            return h.response().code(204);
            
        }
    });

    // ask for the pen
    server.route({
        method: 'GET',
        path: '/room/{room}/pen',
        handler: (request, h) => {
            console.log("User " + request.socket.id + " asks to be writer");
            return server.methods.askToBeWriter({id: request.socket.id}, request.params.room);
        }
    });

    // change username
    server.route({
        method: 'POST',
        path: '/user/change-name',
        handler: (request, h) => {
            server.methods.changeName({id: request.socket.id, name: request.payload[0]}, request.payload[1]);
            return h.response().code(204);
        }
    });
};