
class TitleManager {
    static fakeName = 'Snake' + Math.floor(Math.random() * 990000 + 10000);

    static showedInvite = false;
    static crazyLoading = false;

    static initialize() {
        let name = window.localStorage.getItem('name');
        if (!name) {
            name = TitleManager.fakeName;
        }

        document.getElementById('name').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                TitleManager.requestPlay();
            }
        });

        document.getElementById('name').placeholder = name;

        // if (window.CrazyGames?.SDK?.game) {
        //     console.log(window.CrazyGames.SDK.game.isInstantJoin);
        //     if (window.CrazyGames.SDK.game.isInstantJoin) {

        //     }
        // }
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

            window.CrazyGames.SDK.game.gameplayStart();
        } else if (!hasClient && titleInterface.style.display === 'none') {
            titleInterface.style.display = 'block';
            hudInterface.style.display = 'none';

            document.getElementById('fat1').style.display = 'none';
            document.getElementById('fat2').style.display = 'none';
            document.getElementById('fat3').style.display = 'none';
            document.getElementById('fat4').style.display = 'none';
            document.getElementById('fat5').style.display = 'none';
            const index = Math.min(Math.floor(Math.random() * 5), 4) + 1;
            document.getElementById('fat' + index).style.display = 'block';

            window.CrazyGames.SDK.game.gameplayStop();
        }

        if (crazyInitialized && TitleManager.crazyLoading) {
            TitleManager.crazyLoading = false;
            window.CrazyGames.SDK.game.loadingStop();
        }

        if (!TitleManager.showedInvite && crazyInitialized) {
            window.CrazyGames.SDK.game.loadingStart();
            TitleManager.crazyLoading = true;

            TitleManager.showedInvite = true;
            window.CrazyGames.SDK.game.showInviteButton({
                roomId: 0,
            });

            if (!TitleManager.isOpen()) {
                window.CrazyGames.SDK.game.gameplayStart();
            }
        }
    }

    static requestPlay() {
        const nameInput = document.getElementById('name');
        const name = (nameInput.value || nameInput.placeholder || '').trim();

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