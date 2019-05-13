module.exports = {
    name: 'comocodo-room-management',
    register: async (server) => {

        // in seconds, time before the writer becomes the next person who asked
        const HOTSEAT_TIMER = 60;

        function Room() {
            this._users = {};

            this._hotSeatTimeout = null;
            this._passPen = null;

            this._writer = null;
            this._nextWriter = null;

            this.addUser = (user) => {
                this._users[user.id] = user.name;
                if (this._writer == null) this.setWriter(user.id);
                this.triggerUpdate();
            };

            this.updateUser = (user) => {
                this._users[user.id] = user.name;
                this.triggerUpdate();
            }

            this.removeUser = (userId) => {
                delete this._users[userId];
                if (this._writer == userId) {
                    // handles passing the pen now if someone is waiting for it
                    if (this.dropPen()) return;

                    // if there is someone else in the room, make the "oldest" user writer
                    if (Object.keys(this._users).length)
                        // don't use setWriter, it will set a timeout to pass the pen
                        this._writer = Object.keys(this._users)[0];
                    // or if the leaving user was the last one
                    else
                        this._writer = null;
                }
                this.triggerUpdate();
            };

            this.hasUser = (userId) => Object.keys(this._users).indexOf(userId) !== -1;

            this.getUsers = () => {
                let names = [];
                for (let id in this._users) {
                    if (id == this._writer) names.push({
                        name: this._users[id],
                        id: id,
                        writer: 'current'
                    });
                    else if (id == this._nextWriter) names.push({
                        name: this._users[id],
                        id: id,
                        writer: 'next'
                    });
                    else names.push({
                        name: this._users[id],
                        id: id,
                        writer: false
                    });
                }
                return names;
            }

            this.getWriter = () => this._writer;

            // WIP, not really a setter
            this.setWriter = (userId) => {
                // if the user is not in the room, return
                if (!this.hasUser(userId)) return false;

                // if nobody is writing, set the writer immediately
                if (this._writer == null) {
                    this._writer = userId;
                    this.triggerUpdate();
                    return true;
                }

                // if there is already someone waiting to be writer, return
                if (this._passPen != null) return false;

                this._nextWriter = userId;
                this._passPen = () => {
                    this._writer = userId;
                    this._nextWriter = this._passPen = null;
                    this.triggerUpdate();
                }
                this._hotSeatTimeout = setTimeout(this._passPen, HOTSEAT_TIMER * 1000);
                this.triggerUpdate();
                return true;
            }

            this.dropPen = () => {
                if (this._passPen === null) return false;
                clearTimeout(this._hotSeatTimeout);
                this._hotSeatTimeout = null;
                this._passPen();
                return true;
            }

            // DP listener, simpler and less dependant
            this.onUpdate = (callback, params) => {
                this.update = {callback, params};
            }

            this.triggerUpdate = () => {
                if (typeof this.update !== 'undefined') this.update.callback(...this.update.params);
            }
        }

        // the user log, room by room
        server.app.userLog = {};

        // who is a credentials object {name: 'not so unique name', id: unique_id}

        server.method('enters', async (who, where) => {

            // inits the user log if there is none for the room
            if (!server.app.userLog[where]) {
                server.app.userLog[where] = new Room();
                server.app.userLog[where].onUpdate(server.methods.updateUsersList, [where, server.app.userLog[where]]);
            }
            
            // appends the user
            server.app.userLog[where].addUser(who);

            // now rooms handle broadcasts as an event trigger
            //server.methods.updateUsersList(where, server.app.userLog[where]);
            return true;
        });

        server.method('exits', async (who, where) => {
            // if the room or the user in the room is not found, stop here
            if (!server.app.userLog[where] || !server.app.userLog[where].hasUser(who.id)) return false;

            server.app.userLog[where].removeUser(who.id);

            // now rooms handle broadcasts as an event trigger
            //server.methods.updateUsersList(where, server.app.userLog[where]);
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

        server.method('changeName', (who, where) => {
            server.app.userLog[where].updateUser(who);

            // now rooms handle broadcasts as an event trigger
            //server.methods.updateUsersList(where, server.app.userLog[where]);
        });

        server.method('askToBeWriter', (who, where) => {
            return server.app.userLog[where].setWriter(who.id);
        });

        server.method('dropPen', (who, where) => {
            if (server.app.userLog[where].getWriter() == who.id) {
                return server.app.userLog[where].dropPen();
            }
            return false;
        });

        server.method('isWriter', (who, where) => {
            return server.app.userLog[where].getWriter() === who.id;
        });

        server.method('updateUsersList', async (where, room) => {
            server.publish('/room/' + where + '/users', room.getUsers());
        });
    }
};