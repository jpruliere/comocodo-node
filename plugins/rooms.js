module.exports = {
    name: 'comocodo-room-management',
    register: async (server) => {

        // in seconds, time before the writer becomes the next person who asked
        const HOTSEAT_TIMER = 60;

        function Room() {
            let users = {};

            let hotSeatTimeout = null;
            let passPen = null;

            let writer = null;

            this.addUser = (user) => {
                users[user.id] = user.name;
                if (writer == null) this.setWriter(user.id);
            };

            this.removeUser = (userId) => {
                delete users[userId];
                if (writer == userId) {
                    // handles passing the pen now if someone is waiting for it
                    if (this.dropPen()) return;

                    // if there is someone else in the room, make the "oldest" user writer
                    if (Object.keys(users).length)
                        // don't use setWriter, it will set a timeout to pass the pen
                        writer = Object.keys(users)[0];
                    // or if the leaving user was the last one
                    else
                        writer = null;
                }
            };

            this.hasUser = (userId) => Object.keys(users).indexOf(userId) !== -1;

            this.getUsers = () => {
                let names = [];
                for (let id in users) {
                    if (id == writer) names.push({
                        name: users[id],
                        id: id,
                        writer: true
                    });
                    else names.push({
                        name: users[id],
                        id: id,
                        writer: false
                    });
                }
                return names;
            }

            this.getWriter = () => writer;

            this.setWriter = (userId) => {
                // if the user is not in the room, return
                if (!this.hasUser(userId)) return false;

                // if nobody is writing, set the writer immediately
                if (writer == null) return writer = userId, true;

                // if there is already someone waiting to be writer, return
                if (passPen != null) return false;

                passPen = () => {
                    writer = userId;
                }
                hotSeatTimeout = setTimeout(passPen, HOTSEAT_TIMER * 1000);
                return true;
            }

            this.dropPen = () => {
                if (passPen === null) return false;
                clearTimeout(hotSeatTimeout);
                hotSeatTimeout = null;
                passPen();
                passPen = null;
                return true;
            }
        }

        // the user log, room by room
        server.app.userLog = {};

        // who is a credentials object {name: 'not so unique name', id: unique_id}

        server.method('enters', async (who, where) => {

            // inits the user log if there is none for the room
            if (!server.app.userLog[where]) server.app.userLog[where] = new Room();
            
            // appends the user
            server.app.userLog[where].addUser(who);

            server.methods.updateUsersList(where, server.app.userLog[where]);
            return true;
        });

        server.method('exits', async (who, where) => {
            // if the room or the user in the room is not found, stop here
            if (!server.app.userLog[where] || !server.app.userLog[where].hasUser(who.id)) return false;

            server.app.userLog[where].removeUser(who.id);

            server.methods.updateUsersList(where, server.app.userLog[where]);
            return true;
        });

        server.method('ragequits', async (who) => {
            // when a user disconnects from its websocket, we have to browser the user log
            for (let where in server.app.userLog) {
                // when the room is found, stop browsing
                if (server.methods.exits(who, where)) break;
            }

            // no need to trigger the update, it is done when the right room is found
        });

        server.method('isWriter', (who, where) => {
            return server.app.userLog[where].getWriter() === who.id;
        });

        server.method('updateUsersList', async (where, room) => {
            server.publish('/room/' + where + '/users', room.getUsers());
        });
    }
};