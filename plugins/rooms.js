module.exports = {
    name: 'comocodo-room-management',
    register: async (server) => {
        // who is where
        let whoswhere = [];

        server.method('enters', async (who, where) => {
            if (!whoswhere[where]) whoswhere[where] = [who];
            else whoswhere[where].push(who);

            server.methods.updateUsersList(where);
            return true;
        });

        server.method('exits', async (who, where) => {
            if (!whoswhere[where]) return false;

            let whosIndex = whoswhere.findIndex((u) => u.user == who.user);
            if (whosIndex === -1) return false;

            whoswhere.splice(whosIndex, 1);

            server.methods.updateUsersList(where);
            return true;
        });

        server.method('updateUsersList', async (room) => {
            console.log(whoswhere);
            server.publish('/room/' + room + '/users', whoswhere[room]);
        });
    }
};