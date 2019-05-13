const Nes = require('nes');
const client = new Nes.Client('ws://localhost:3000');

const app = {
    room: location.pathname.match(/\/room\/([^/]+)/)[1],
    ghostMode: false,
    writer: false,
    updateSourceIsMe: false,
    scriptBox: document.querySelector('#mcd-builder'),
    usersList: document.querySelector('#users-list'),
    nameHolder: document.querySelector('#user-name'),
    roomHolder: document.querySelector('#room-name'),
    penButton: document.querySelector('#ask-writer'),
    diagramBox: document.querySelector('#diagram-output'),
    
    init: async () => {

        app.roomHolder.textContent = app.room;
        app.nameHolder.textContent = app.getName();

        await app.initClient();
        app.initSubscriptions();
        app.initEvents();

        let script = await client.request(location.pathname + '/get');
        app.updateScriptBox(script.payload);
    },

    initClient: async () => {
        client.onError = console.log;
        await client.connect({
            auth: {
                headers: {
                    authorization: 'Basic ' + btoa(app.getName()+':')
                }
            }
        });
    },
    initSubscriptions: () => {
        client.subscribe(location.pathname + '/users', app.updateUsersList);
        client.subscribe(location.pathname + '/updates', app.updateScriptBox);
        client.subscribe(location.pathname + '/diagram', app.updateDiagramBox);
    },
    initEvents: () => {
        app.nameHolder.addEventListener('click', app.changeName);
        app.roomHolder.addEventListener('click', app.changeRoom);
        app.penButton.addEventListener('click', app.askForThePen);
        app.scriptBox.addEventListener('input', app.handleScriptUpdate);
    },

    updateUsersList: (update) => {
        app.usersList.innerHTML = '';
        update.forEach(user => {
            let li = document.createElement('li');
            li.innerText = user.name;
            li.dataset.socketId = user.id;

            // found myself
            if (user.id == client.id) {
                app.setWriter(user.writer == "current");
            }

            if (user.writer == "current") {
                // make it obvious
                li.classList.add('writer');
                // if it is not me, disable the textarea
                app.scriptBox.disabled = !app.writer;
            } else if (user.writer == "next") {
                li.classList.add('next-writer');
                if (app.writer) {
                    app.penButton.style.display = "block";
                }
            }
            app.usersList.appendChild(li);
        });
    },
    updateScriptBox: (update) => {
        if (!update) update = "";
        if (!app.updateSourceIsMe)
            app.scriptBox.value = update;
        app.updateSourceIsMe = false;
    },
    updateDiagramBox: (diagram) => {
        if (!diagram) return;
        app.diagramBox.innerHTML = diagram;
    },
    setWriter: (amWriter) => {
        if (amWriter && !app.writer) {
            app.writer = true;
            app.penButton.style.display = "none";
            app.penButton.textContent = "Drop the pen";
            app.penButton.removeEventListener('click', app.askForThePen);
            app.penButton.addEventListener('click', app.dropThePen);
        } else if (!amWriter && app.writer) {
            app.writer = false;
            app.penButton.removeEventListener('click', app.dropThePen);
            app.penButton.addEventListener('click', app.askForThePen);
            app.penButton.textContent = 'Ask for the pen';
        }
    },
    askForThePen: () => {
        client.request({
            path: location.pathname + '/pen',
            method: 'GET'
        });
    },
    dropThePen: () => {
        client.request({
            path: location.pathname + '/pen/drop',
            method: 'GET'
        }).then((ok) => {
            if (ok) {
                app.setWriter(false);
            }
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
    },
    changeName: () => {
        let newName = prompt('Enter your new username');
        if (!newName) return;
        app.setName(newName);
        client.request({
            path: '/user/change-name',
            method: 'POST',
            payload: [newName, app.room]
        }).then(() => app.nameHolder.textContent = newName);
    },
    changeRoom: () => {
        let newRoom = prompt('Where to go ?');
        if (!newRoom) return;
        location.href = '/room/' + newRoom;
    },
    handleScriptUpdate: (evt) => {
        app.updateSourceIsMe = true;
        client.request({
            path: location.pathname + '/update',
            method: 'POST',
            payload: [evt.target.value]
        });
    }
};

document.addEventListener('DOMContentLoaded', app.init);