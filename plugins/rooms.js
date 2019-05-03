module.exports = {
    name: 'comocodo-room-management',
    register: async (server) => {
        // the user log, room by room
        server.app.whoswhere = {};

        // who is a credentials object {name: 'not so unique name', id: unique_id}

        server.method('enters', async (who, where) => {
            console.debug(who.name + ' enters ' + where);

            // inits the user log if there is none for the room
            if (!server.app.whoswhere[where]) server.app.whoswhere[where] = {};
            
            // appends the user
            server.app.whoswhere[where][who.id] = who.name;

            server.methods.updateUsersList(where);
            return true;
        });

        server.method('exits', async (who, where) => {
            // if the room or the user in the room is not found, stop here
            if (!server.app.whoswhere[where] || !server.app.whoswhere[where][who.id]) return false;

            console.debug(who.name + ' leaves ' + where);
            delete server.app.whoswhere[where][who.id];

            server.methods.updateUsersList(where);
            return true;
        });

        server.method('ragequits', async (who) => {
            // when a user disconnects from its websocket, we have to browser the user log
            for (let where in server.app.whoswhere) {
                // when the room is found, stop browsing
                if (server.methods.exits(who, where)) break;
            }

            // no need to trigger the update, it is done when the right room is found
        })

        server.method('updateUsersList', async (room) => {
            server.publish('/room/' + room + '/users', Object.values(server.app.whoswhere[room]));
        });
    }
};