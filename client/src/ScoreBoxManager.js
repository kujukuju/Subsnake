class ScoreBoxManager {
    static XP_SCALE = 1000;

    static _lineCount = 0;
    static _scoreElements = [];
    static _scores = [];

    static _roomType = null;

    static update(time, dt) {
        const highscores = [];

        for (const snakeID in SnakeManager.snakes) {
            const snake = SnakeManager.snakes[snakeID];

            highscores.push({
                snake: snake,
                score: snake.score,
            });
        }

        highscores.sort((a, b) => {
            return b.score - a.score;
        });

        highscores.length = Math.min(highscores.length, 10);

        ScoreBoxManager.setLineCount(highscores.length);
        for (let i = 0; i < highscores.length; i++) {
            ScoreBoxManager.setScore(i, i, String(highscores[i].snake.name || '-'), highscores[i].snake.score);
        }
    }

    static setScore(line, level, name, xp) {
        if (!ScoreBoxManager._scoreElements[line]) {
            console.warn('Tried to set a score for a line that wasn\'t created. ', line, level, name, xp);
            return;
        }

        if (ScoreBoxManager._scores[line]) {
            let equal = true;
            equal = equal && ScoreBoxManager._scores[line][0] === level;
            equal = equal && ScoreBoxManager._scores[line][1] === name;
            equal = equal && ScoreBoxManager._scores[line][2] === xp;

            if (equal) {
                return;
            }
        }

        const [rootElement, levelElement, nameElement, xpElement] = ScoreBoxManager._scoreElements[line];
        const correctedLevel = String(level);
        if (levelElement.innerText !== correctedLevel) {
            levelElement.innerText = correctedLevel;
        }
        const correctedName = String(name);
        if (nameElement.innerText !== correctedName) {
            nameElement.innerText = correctedName;
        }
        const correctedXP = String(xp);
        if (xpElement.innerText !== correctedXP) {
            xpElement.innerText = correctedXP;
        }

        ScoreBoxManager._scores[line] = [level, name, xp];
    }

    static setLineCount(count) {
        if (ScoreBoxManager._lineCount === count) {
            return;
        }
        ScoreBoxManager._lineCount = count;

        // html elements
        const scoresContainer = document.getElementById('score-lines-container');
        while (ScoreBoxManager._scoreElements.length > count) {
            const elements = ScoreBoxManager._scoreElements.pop();
            scoresContainer.removeChild(elements[0]);

            ScoreBoxManager._scores.pop();
        }

        while (ScoreBoxManager._scoreElements.length < count) {
            const line = document.createElement('div');
            line.className = 'scoreLine';
            scoresContainer.appendChild(line);

            const level = document.createElement('div');
            level.className = 'level';
            line.appendChild(level);

            const name = document.createElement('div');
            name.className = 'name';
            line.appendChild(name);

            const xp = document.createElement('div');
            xp.className = 'xp';
            line.appendChild(xp);

            ScoreBoxManager._scoreElements.push([line, level, name, xp]);
        }
    }
}