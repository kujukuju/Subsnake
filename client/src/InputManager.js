class InputManager {
    static keys = new Set();

    static mouseDownLeft = false;
    static mouseDownRight = false;

    static mousePosition = [0, 0];

    static initialize() {
        const canvasContainer = document.getElementById('canvas-container');

        window.addEventListener('blur', event => {
            InputManager.keys.clear();
            InputManager.mouseDownLeft = false;
            InputManager.mouseDownRight = false;
        });

        window.addEventListener('keydown', event => {
            // this indicates it's a mobile device
            if (!event.key) {
                return true;
            }

            if (ChatManager.isGlobalVisible()) {
                if (event.key.toLowerCase() === 'enter') {
                    ChatManager.focus();
                }
                if (event.key.toLowerCase() === 'escape') {
                    ChatManager.closeGlobal();
                }

                return true;
            }

            const inputEvent = event.target.tagName.toLowerCase() === 'input';

            if (TitleManager.isOpen()) {
                if (event.key.toLowerCase() === 'enter' && !inputEvent) {
                    TitleManager.requestPlay();
                }

                return true;
            }

            if (event.key.toLowerCase() === 'escape') {
                if (ChatManager.isVisible()) {
                    ChatManager.blur();
                }

                event.preventDefault();
                return false;
            }

            if (event.key.toLowerCase() === 'enter') {
                ChatManager.focus();

                event.preventDefault();
                return false;
            }

            if (event.target.tagName.toLowerCase() === 'input') {
                return true;
            }

            InputManager.keys.add(event.key.toLowerCase());

            return true;
        }, true);
        window.addEventListener('keyup', event => {
            // this indicates it's a mobile device
            if (!event.key) {
                return true;
            }

            InputManager.keys.delete(event.key.toLowerCase());

            return true;
        }, true);

        const chatContainer = document.getElementById('chat-container');
        const chatExpandTab = document.getElementById('chat-expand-tab');
        const scoreboxContainer = document.getElementById('scorebox-container');
        window.addEventListener('mousedown', event => {
            if (TitleManager.isOpen()) {
                return true;
            }

            if (ChatManager.isVisible() && chatContainer.contains(event.target)) {
                return true;
            }

            if (chatExpandTab.contains(event.target)) {
                return true;
            }

            if (event.button === 0) {
                InputManager.mouseDownLeft = true;
            }
            if (event.button === 2) {
                InputManager.mouseDownRight = true;
            }

            return true;
        }, true);
        window.addEventListener('mouseup', event => {
            if (event.button === 0) {
                InputManager.mouseDownLeft = false;
            }
            if (event.button === 2) {
                InputManager.mouseDownRight = false;
            }

            return true;
        }, true);

        window.addEventListener('mousemove', event => {
            if (TitleManager.isOpen()) {
                return true;
            }

            InputManager.mousePosition[0] = event.clientX;
            InputManager.mousePosition[1] = event.clientY;

            return true;
        }, true);

        window.addEventListener('touchstart', event => {
            if (TitleManager.isOpen()) {
                return true;
            }

            if (event.target.tagName.toLowerCase() === 'input') {
                return true;
            }

            if (ChatManager.isVisible() && chatContainer.contains(event.target)) {
                return true;
            }

            if (ChatManager.isVisible()) {
                ChatManager.blur();
            }

            if (chatExpandTab.contains(event.target)) {
                return true;
            }

            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                MobileInputProcessorSystem.addTouch(touch.identifier, event.timeStamp, touch.clientX, touch.clientY);
            }

            event.preventDefault();
            return false;
        }, {passive: false});
        window.addEventListener('touchmove', event => {
            if (TitleManager.isOpen()) {
                return true;
            }

            if (event.target.tagName.toLowerCase() === 'input') {
                return true;
            }

            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                MobileInputProcessorSystem.moveTouch(touch.identifier, event.timeStamp, touch.clientX, touch.clientY);
            }

            event.preventDefault();
            return false;
        }, {passive: false});
        window.addEventListener('touchend', event => {
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                MobileInputProcessorSystem.endTouch(touch.identifier, event.timeStamp, touch.clientX, touch.clientY);
            }

            return true;
        }, {passive: false});
        window.addEventListener('touchcancel', event => {
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                MobileInputProcessorSystem.endTouch(touch.identifier, event.timeStamp, touch.clientX, touch.clientY);
            }

            return true;
        }, {passive: false});

        window.addEventListener('contextmenu', event => {
            event.preventDefault();
            return false;
        }, true);
    }
}
