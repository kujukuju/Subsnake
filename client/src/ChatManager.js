class ChatManager {
    static MESSAGE_TIME = 20000;
    static MAX_MESSAGES_PER_TIME = 8;

    static MESSAGE_TYPE_ROOM = 0;

    static _visible = false;
    static _globalVisible = false;
    static _focused = false;
    static _mouseOver = false;
    static _waitingForMouseOver = false;
    static _allowedToMouseOverClear = false;
    // [type, element]
    static _chatLinesByFriendID = {};
    static _lockedToBottom = true;
    static _lastScroll = 0;
    static _requestFocus = false;
    static _hidingInput = false;

    static _messageTimes = [];

    static _messageID = 0;

    static initialize() {
        const chatExpandTab = document.getElementById('chat-expand-tab');
        chatExpandTab.addEventListener('click', event => {
            ChatManager._mouseOver = true;
            ChatManager._waitingForMouseOver = true;
            ChatManager._allowedToMouseOverClear = true;

            ChatManager._adjustVisibility();
            ChatManager.focus();

            event.preventDefault();
            return false;
        });

        const chat = document.getElementById('chat-container');
        chat.addEventListener('mouseover', event => {
            if (ChatManager._visible) {
                ChatManager._mouseOver = true;
            }
            if (ChatManager._allowedToMouseOverClear) {
                ChatManager._waitingForMouseOver = false;
            }
        });
        chat.addEventListener('mouseleave', () => {
            if (!ChatManager._waitingForMouseOver) {
                ChatManager._mouseOver = false;
                ChatManager._adjustVisibility();
            }
        });

        const input = document.getElementById('chat-input-text-input');
        input.addEventListener('focus', event => {
            ChatManager._focused = true;
            ChatManager._waitingForMouseOver = false;
            ChatManager._allowedToMouseOverClear = false;

            ChatManager._adjustVisibility();
        });
        input.addEventListener('blur', () => {
            ChatManager._focused = false;
            ChatManager._adjustVisibility();
        });

        const historyScrollable = document.getElementById('chat-history-text');
        historyScrollable.addEventListener('scroll', event => {
            const maxScroll = historyScrollable.scrollHeight - historyScrollable.getBoundingClientRect().height;
            ChatManager._lockedToBottom = Math.abs(historyScrollable.scrollTop - maxScroll) < 1;
        });

        const sendButton = document.getElementById('send-button');
        sendButton.addEventListener('click', event => {
            ChatManager._send();
        });

        // its kinda annoying to accidentally click out, and theres an exit button
        // const globalChatCover = document.getElementById('global-chat-cover');
        // globalChatCover.addEventListener('click', event => {
        //     ChatManager.closeGlobal();
        // });

        const chatExitButton = document.getElementById('chat-exit-button');
        chatExitButton.addEventListener('click', event => {
            ChatManager.closeGlobal();
        });
    }

    static update(time, dt) {
        // if you're in the game but global is visible disable it
        if (!PaginationManager.isVisible() && ChatManager._globalVisible) {
            ChatManager.closeGlobal();
        }

        const shouldHideInput = ChatManager._globalVisible;
        if (ChatManager._hidingInput !== shouldHideInput) {
            ChatManager._hidingInput = shouldHideInput;

            const chat = document.getElementById('chat-container');
            if (shouldHideInput) {
                chat.classList.add('hiddenInput');
            } else {
                chat.classList.remove('hiddenInput');
            }
        }
    }

    static updateRender(time, dt) {
        if (ChatManager._requestFocus) {
            ChatManager._requestFocus = false;

            const input = document.getElementById('chat-input-text-input');
            input.focus();
        }
    }

    static addLine(name, text) {
        const scrollingHistory = document.getElementById('chat-history-text-scroll');

        // if you're on the all tab, or you're on the correct friend tab, add this in
        const shouldAdd = true;

        let otherID = null;
        const lineElement = document.createElement('div');
        lineElement.className = 'historyLine';
        if (shouldAdd) {
            scrollingHistory.appendChild(lineElement);
        }

        const nameElement = document.createElement('div');
        nameElement.className = 'historyLineName';
        nameElement.innerText = name;
        lineElement.appendChild(nameElement);

        const colonElement = document.createElement('div');
        colonElement.className = 'historyLineColon';
        colonElement.innerText = ': ';
        lineElement.appendChild(colonElement);

        const textElement = document.createElement('div');
        textElement.className = 'historyLineText';
        textElement.innerText = text;
        lineElement.appendChild(textElement);

        ChatManager._finalizeChatLine();
    }

    static addErrorLine(text) {
        const scrollingHistory = document.getElementById('chat-history-text-scroll');

        const lineElement = document.createElement('div');
        lineElement.className = 'historyLine notice';
        lineElement.innerText = text;
        scrollingHistory.appendChild(lineElement);

        ChatManager._finalizeChatLine();
    }

    static focus() {
        const input = document.getElementById('chat-input-text-input');

        if (ChatManager._focused) {
            ChatManager._send();

            if (!ChatManager._globalVisible) {
                input.blur();
            }
        } else {
            input.focus();
        }
    }

    static blur() {
        ChatManager._mouseOver = false;
        ChatManager._waitingForMouseOver = false;
        ChatManager._allowedToMouseOverClear = false;

        ChatManager._adjustVisibility();

        const input = document.getElementById('chat-input-text-input');
        input.blur();
    }

    static isVisible() {
        return ChatManager._visible;
    }

    static isGlobalVisible() {
        return ChatManager._globalVisible;
    }

    static openGlobal() {
        if (ChatManager._globalVisible) {
            return;
        }
        ChatManager._globalVisible = true;

        const globalChatCover = document.getElementById('global-chat-cover');
        globalChatCover.classList.add('visible');

        ChatManager._requestFocus = true;

        ChatManager._adjustVisibility();
    }

    static closeGlobal() {
        if (!ChatManager._globalVisible) {
            return;
        }
        ChatManager._globalVisible = false;
        // force close all potential states
        ChatManager._mouseOver = false;
        if (ChatManager._focused) {
            ChatManager.blur();
        }

        const globalChatCover = document.getElementById('global-chat-cover');
        globalChatCover.classList.remove('visible');

        ChatManager._adjustVisibility();
    }

    static _adjustVisibility() {
        if (ChatManager._focused || ChatManager._mouseOver || ChatManager._globalVisible) {
            ChatManager._opaque();
        } else {
            ChatManager._transparent();
        }
    }

    static _send() {
        const input = document.getElementById('chat-input-text-input');

        const message = input.value;
        if (message.length > 240) {
            input.style.color = '#ff0000';
            return;
        }

        if (message.length === 0) {
            return;
        }

        const now = Date.now();
        if (!ChatManager._canSendMessage(now)) {
            ChatManager.addErrorLine('You\'re sending too many messages!');
            return;
        }
        ChatManager._addMessageSendTime(now);

        Packets.writeMessagePacket(message);

        if (ChatManager._globalVisible) {
            input.focus();
        }

        input.value = '';
    }

    static _finalizeChatLine() {
        if (ChatManager._lockedToBottom) {
            const historyScrollable = document.getElementById('chat-history-text');
            const maxScroll = historyScrollable.scrollHeight - historyScrollable.getBoundingClientRect().height;

            historyScrollable.scrollTo(0, maxScroll);
        }
    }

    static _opaque() {
        if (ChatManager._visible) {
            return;
        }
        ChatManager._visible = true;

        const chatExpandTab = document.getElementById('chat-expand-tab');
        chatExpandTab.classList.remove('expanded');

        const chat = document.getElementById('chat-container');
        chat.classList.remove('transparent');
    }

    static _transparent() {
        if (!ChatManager._visible) {
            return;
        }
        ChatManager._visible = false;

        const chatExpandTab = document.getElementById('chat-expand-tab');
        chatExpandTab.classList.add('expanded');

        const chat = document.getElementById('chat-container');
        chat.classList.add('transparent');
    }

    static _canSendMessage(time) {
        while (ChatManager._messageTimes.length > 0 && ChatManager._messageTimes[0] < time - ChatManager.MESSAGE_TIME) {
            ChatManager._messageTimes.shift();
        }

        return ChatManager._messageTimes.length < ChatManager.MAX_MESSAGES_PER_TIME;
    }

    static _addMessageSendTime(time) {
        ChatManager._messageTimes.push(time);
    }
}
