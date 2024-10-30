
class TitleManager {
    static fakeName = 'Snake' + Math.floor(Math.random() * 990000 + 10000);

    static initialize() {
        let name = window.localStorage.getItem('name');
        if (!name) {
            name = TitleManager.fakeName;
        }

        document.getElementById('name').placeholder = name;
    }

    static update() {
        let hasClient = true;
        hasClient = hasClient && clientID;
        hasClient = hasClient && SnakeManager.snakes[clientID];

        const titleInterface = document.getElementById('title-interface');
        const hudInterface = document.getElementById('hud');

        if (hasClient && titleInterface.style.display === 'block') {
            titleInterface.style.display = 'none';
            hudInterface.style.display = 'block';
        } else if (!hasClient && titleInterface.style.display === 'none') {
            titleInterface.style.display = 'block';
            hudInterface.style.display = 'none';
        }
    }

    static requestPlay() {
        const nameInput = document.getElementById('name');
        const name = (nameInput.value ?? nameInput.placeholder ?? '').trim();

        Packets.writePlayPacket(name);

        if (name !== TitleManager.fakeName) {
            window.localStorage.setItem('name', name);
        }
    }

    static isOpen() {
        let hasClient = true;
        hasClient = hasClient && clientID;
        hasClient = hasClient && SnakeManager.snakes[clientID];
        return !hasClient;
    }
}