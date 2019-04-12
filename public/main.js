const Nes = require('nes');
const client = new Nes.Client('ws://localhost:3000');

const app = {
    room: location.pathname.match(/\/room\/([^/]+)/)[1],
    updateSourceIsMe: false,
    scriptBox: document.querySelector('#mcd-builder'),
    init: async () => {
        
        await client.connect();

        const handler = (update) => {
            if (!app.updateSourceIsMe)
                app.scriptBox.value = update;
            app.updateSourceIsMe = false;
        }

        fetch(location.pathname + '/get').then((response) => {
            response.text().then(handler);
        });
        
        client.subscribe(location.pathname, handler);

        app.scriptBox.addEventListener('input', (evt) => {
            app.updateSourceIsMe = true;
            fetch(location.pathname + '/update', {
                method: 'POST',
                body: evt.target.value
            });
        })
    }
}

document.addEventListener('DOMContentLoaded', app.init);