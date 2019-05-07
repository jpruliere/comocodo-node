const Nes = require('nes');
const client = new Nes.Client('ws://localhost:3000');

const app = {
    room: location.pathname.match(/\/room\/([^/]+)/)[1],
    ghostMode: false,
    updateSourceIsMe: false,
    scriptBox: document.querySelector('#mcd-builder'),
    usersList: document.querySelector('#users-list'),
    nameHolder: document.querySelector('#user-name'),
    init: async () => {

        client.onError = (err) => console.log(err);
        await client.connect({
            auth: {
                headers: {
                    authorization: 'Basic ' + btoa(app.getName()+':')
                }
            }
        });

        app.nameHolder.textContent = "(as " + app.getName() + ")";

        const updateUsersList = (update) => {
            app.usersList.innerHTML = '';
            update.forEach(user => {
                let li = document.createElement('li');
                li.innerText = user.name;
                li.dataset.socketId = user.id;
                if (user.writer) {
                    // make it obvious
                    li.classList.add('writer');
                    // if it is not me, disable the textarea
                    app.scriptBox.disabled = user.id != client.id;
                }
                app.usersList.appendChild(li);
            });
        };

        client.subscribe(location.pathname + '/users', updateUsersList);

        const updateScriptBox = (update) => {
            if (!update) update = "";
            if (!app.updateSourceIsMe)
                app.scriptBox.value = update;
            app.updateSourceIsMe = false;
        };

        let script = await client.request(location.pathname + '/get');
        updateScriptBox(script.payload);
        
        client.subscribe(location.pathname + '/updates', updateScriptBox);

        document.querySelector('#change-user-name').addEventListener('click', () => {
            let newName = prompt('Enter your new username');
            if (!newName) return;
            app.setName(newName);
            client.request({
                path: '/user/change-name',
                method: 'POST',
                payload: [newName, app.room]
            }).then(() => app.nameHolder.textContent = "(as " + newName + ")");
        });

        app.scriptBox.addEventListener('input', (evt) => {
            app.updateSourceIsMe = true;
            client.request({
                path: location.pathname + '/update',
                method: 'POST',
                payload: [evt.target.value]
            });
        });
    },
    getName: () => {
        if (!app.hasName()) {
            app.setName(prompt('Enter your username'));
        }
        return localStorage.getItem('username');
    },
    setName: (name) => {
        localStorage.setItem('username', name);
    },
    hasName: () => {
        return !!localStorage.getItem('username');
    }
};

document.addEventListener('DOMContentLoaded', app.init);