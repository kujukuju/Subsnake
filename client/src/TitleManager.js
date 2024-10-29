
class TitleManager {
    static update() {
        let hasClient = true;
        hasClient = hasClient && clientID;
        hasClient = hasClient && SnakeManager.snakes[clientID];

        const titleInterface = document.getElementById('title-interface');

        if (hasClient && titleInterface.style.display === 'block') {
            titleInterface.style.display = 'none';
        } else if (!hasClient && titleInterface.style.display === 'none') {
            titleInterface.style.display = 'block';
        }
    }
}