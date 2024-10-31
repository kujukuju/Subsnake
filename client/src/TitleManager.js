
class TitleManager {
    static fakeName = 'Snake' + Math.floor(Math.random() * 990000 + 10000);

    static showedInvite = false;
    static crazyLoading = false;

    static deadOpenTime = 0;

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
    }

    static update() {
        let hasClient = true;
        hasClient = hasClient && clientID;
        hasClient = hasClient && SnakeManager.snakes[clientID];

        if (hasClient) {
            TitleManager.deadOpenTime = Loop.loopTime + 2000;
        }

        const shouldOpen = !hasClient && Loop.loopTime >= TitleManager.deadOpenTime;

        const titleInterface = document.getElementById('title-interface');
        const hudInterface = document.getElementById('hud');

        if (!shouldOpen && titleInterface.style.display === 'block') {
            titleInterface.style.display = 'none';
            hudInterface.style.display = 'block';

            if (crazyInitialized) {
                window.CrazyGames.SDK.game.gameplayStart();
            }
        } else if (shouldOpen && titleInterface.style.display === 'none') {
            titleInterface.style.display = 'block';
            hudInterface.style.display = 'none';

            document.getElementById('fat1').style.display = 'none';
            document.getElementById('fat2').style.display = 'none';
            document.getElementById('fat3').style.display = 'none';
            document.getElementById('fat4').style.display = 'none';
            document.getElementById('fat5').style.display = 'none';
            const index = Math.min(Math.floor(Math.random() * 5), 4) + 1;
            document.getElementById('fat' + index).style.display = 'block';

            if (crazyInitialized) {
                window.CrazyGames.SDK.game.gameplayStop();
                window.CrazyGames.SDK.game.showInviteButton({
                    roomId: 1,
                });
            }
        }

        if (crazyInitialized && TitleManager.crazyLoading) {
            TitleManager.crazyLoading = false;
            window.CrazyGames.SDK.game.loadingStop();
        }

        if (crazyInitialized && !TitleManager.showedInvite) {
            window.CrazyGames.SDK.game.loadingStart();
            TitleManager.crazyLoading = true;

            TitleManager.showedInvite = true;
            const link = window.CrazyGames.SDK.game.inviteLink({
                roomId: 1,
            });
            console.log('Invite link: ', link);
            const showLink = window.CrazyGames.SDK.game.showInviteButton({
                roomId: 1,
            });
            console.log('Show invite link: ', showLink);

            if (!TitleManager.isOpen()) {
                window.CrazyGames.SDK.game.gameplayStart();
            }

            console.log('Insant join: ', window.CrazyGames.SDK.game.isInstantJoin);
            if (TitleManager.isOpen() && window.CrazyGames.SDK.game.isInstantJoin) {
                TitleManager.requestPlay();
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
        return document.getElementById('title-interface').style.display === 'block';
    }
}