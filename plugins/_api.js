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

    let roomTimeouts = {};

    // update the script
    server.route({
        method: 'POST',
        path: '/room/{room}/update',
        handler: (request, h) => {

            // only accept updates from the writer
            if (!server.methods.isWriter(Object.assign(request.auth.credentials, {id: request.socket.id}), request.params.room))
                return h.response().code(403);

            let room = request.params.room;
            clearTimeout(roomTimeouts[room]);
            roomTimeouts[room] = setTimeout(async () => {
                let svg = await sc.generate(request.params.room);
                server.publish('/room/' + room + '/diagram', svg);
            }, 2000);
            
            sc.save(room, request.payload);
            server.publish('/room/' + room + '/updates', request.payload);
            return h.response().code(204);
            
        }
    });

    // ask for the pen
    server.route({
        method: 'GET',
        path: '/room/{room}/pen',
        handler: (request, h) => {
            return server.methods.askToBeWriter({id: request.socket.id}, request.params.room);
        }
    });

    server.route({
        method: 'GET',
        path: '/room/{room}/pen/drop',
        handler: (request, h) => {
            return server.methods.dropPen({id: request.socket.id}, request.params.room);
        }
    })

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