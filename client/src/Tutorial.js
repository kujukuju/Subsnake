
class Tutorial {
    static text1;
    static text2;
    static text3;
    static text4;

    static tutorialStage = 0;
    static tutorialStageTime = 0;

    static initialize() {
        Tutorial.text1 = new PIXI.Text('Use your mouse or tap to move!', {fontFamily: 'Pixel', fontSize: 64, fill: 0xffffff, align: 'center'});
        Tutorial.text2 = new PIXI.Text('There\'s gravity!\n\nIf you\'re not underground, you\'ll fall!', {fontFamily: 'Pixel', fontSize: 64, fill: 0xffffff, align: 'center'});
        Tutorial.text3 = new PIXI.Text('Left click or use two fingers to boost!', {fontFamily: 'Pixel', fontSize: 64, fill: 0xffffff, align: 'center'});
        Tutorial.text4 = new PIXI.Text('Kill other snakes by making them run\ninto your tail!', {fontFamily: 'Pixel', fontSize: 64, fill: 0xffffff, align: 'center'});

        Tutorial.text1.anchor.x = 0.5;
        Tutorial.text2.anchor.x = 0.5;
        Tutorial.text3.anchor.x = 0.5;
        Tutorial.text4.anchor.x = 0.5;

        Tutorial.text1.visible = false;
        Tutorial.text2.visible = false;
        Tutorial.text3.visible = false;
        Tutorial.text4.visible = false;

        Renderer.fixed.addChild(Tutorial.text1);
        Renderer.fixed.addChild(Tutorial.text2);
        Renderer.fixed.addChild(Tutorial.text3);
        Renderer.fixed.addChild(Tutorial.text4);

        Tutorial.tutorialStage = Number.parseInt(window.localStorage.getItem('tutorial') || '0');
    }

    static reset() {
        window.localStorage.removeItem('tutorial');
        Tutorial.tutorialStage = 0;
        Tutorial.tutorialStageTime = 0;
    }
    
    static update() {
        Tutorial.text1.position.x = window.innerWidth / 2;
        Tutorial.text1.position.y = window.innerHeight / 8;
        Tutorial.text2.position.x = Tutorial.text1.position.x;
        Tutorial.text2.position.y = Tutorial.text1.position.y;
        Tutorial.text3.position.x = Tutorial.text1.position.x;
        Tutorial.text3.position.y = Tutorial.text1.position.y;
        Tutorial.text4.position.x = Tutorial.text1.position.x;
        Tutorial.text4.position.y = Tutorial.text1.position.y;

        Tutorial.text1.scale.x = window.innerWidth / 1920;
        Tutorial.text1.scale.y = Tutorial.text1.scale.x;
        Tutorial.text2.scale.x = Tutorial.text1.scale.x;
        Tutorial.text2.scale.y = Tutorial.text1.scale.y;
        Tutorial.text3.scale.x = Tutorial.text1.scale.x;
        Tutorial.text3.scale.y = Tutorial.text1.scale.y;
        Tutorial.text4.scale.x = Tutorial.text1.scale.x;
        Tutorial.text4.scale.y = Tutorial.text1.scale.y;

        Tutorial.text1.visible = false;
        Tutorial.text2.visible = false;
        Tutorial.text3.visible = false;
        Tutorial.text4.visible = false;

        if (!SnakeManager.snakes[clientID]) {
            return;
        }

        if (Tutorial.tutorialStageTime === 0) {
            Tutorial.tutorialStageTime = Loop.loopTime;
        }

        if (Loop.loopTime < Tutorial.tutorialStageTime) {
            return;
        }

        if (Tutorial.tutorialStage === 0) {
            Tutorial.text1.visible = true;

            if (Loop.loopTime - Tutorial.tutorialStageTime > 8000) {
                window.localStorage.setItem('tutorial', 1);
                
                Tutorial.tutorialStage = 1;
                Tutorial.tutorialStageTime = Loop.loopTime + 1000;
            }
        } else if (Tutorial.tutorialStage === 1) {
            Tutorial.text2.visible = true;

            if (Loop.loopTime - Tutorial.tutorialStageTime > 8000) {
                window.localStorage.setItem('tutorial', 2);
                
                Tutorial.tutorialStage = 2;
                Tutorial.tutorialStageTime = Loop.loopTime + 1000;
            }
        } else if (Tutorial.tutorialStage === 2) {
            Tutorial.text3.visible = true;

            if (Loop.loopTime - Tutorial.tutorialStageTime > 8000) {
                window.localStorage.setItem('tutorial', 3);
                
                Tutorial.tutorialStage = 3;
                Tutorial.tutorialStageTime = Loop.loopTime + 1000;
            }
        } else if (Tutorial.tutorialStage === 3) {
            Tutorial.text4.visible = true;

            if (Loop.loopTime - Tutorial.tutorialStageTime > 8000) {
                window.localStorage.setItem('tutorial', 4);
                
                Tutorial.tutorialStage = 4;
                Tutorial.tutorialStageTime = Loop.loopTime + 1000;
            }
        }
    }
}
