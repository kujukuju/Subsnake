class AudioManager {
    static NORMAL_MUSIC = [
        new NSWA.Source('assets/zapsplat1.mp3', {loop: false, volume: 0.4}),
        new NSWA.Source('assets/zapsplat2.mp3', {loop: false, volume: 0.4}),
    ];
    static normalIndex = Math.random() < 0.5 ? 0 : 1;

    static HIT_AUDIO = new NSWA.Source('assets/pop3.wav', {loop: false, volume: 0.5});
    static hitNoises = [];
    static hitIndex = 0;

    static BOOST_AUDIO = new NSWA.Source('assets/teleport.mp3', {loop: false, volume: 0.4});
    static boostNoises = [];
    static boostIndex = 0;

    static DEATH_AUDIO = new NSWA.Source('assets/death.wav', {loop: false, volume: 0.5});
    static deathNoises = [];
    static deathIndex = 0;

    static requestedMusic = 'normal';
    static currentAudio = null;

    static position = new Vec2(0, 0);

    static initialize() {
        NSWA.setListenerOrientation(0, 0, 1, 0, -1, 0);
        NSWA.setVolume(1);

        for (let i = 0; i < 40; i++) {
            AudioManager.hitNoises.push(AudioManager.HIT_AUDIO.create());
            AudioManager.hitNoises[i].setPannerOrientation(0, 0, -1);
        }

        for (let i = 0; i < 10; i++) {
            AudioManager.boostNoises.push(AudioManager.BOOST_AUDIO.create());
            AudioManager.boostNoises[i].setPannerOrientation(0, 0, -1);
        }

        for (let i = 0; i < 10; i++) {
            AudioManager.deathNoises.push(AudioManager.DEATH_AUDIO.create());
            AudioManager.deathNoises[i].setPannerOrientation(0, 0, -1);
        }
    }

    static getScale() {
        return Math.max(Camera.scale.x, Camera.scale.y) * 3 * 0.02;
    }

    static update() {
        const scale = AudioManager.getScale();

        AudioManager.position.x = Camera.aabb.x + Camera.aabb.width / 2;
        AudioManager.position.y = Camera.aabb.y + Camera.aabb.height / 2;
        NSWA.setListenerPosition(AudioManager.position.x * scale, AudioManager.position.y * scale, 10); // maybe z should be back a little bit? like 20

        for (let i = 0; i < AudioManager.hitNoises.length; i++) {
            const noise = AudioManager.hitNoises[i];
            if (noise.isPlaying()) {
                if (noise.getCurrentTime() >= AudioManager.HIT_AUDIO.getDuration()) {
                    noise.stop();
                }
            }
        }

        for (let i = 0; i < AudioManager.boostNoises.length; i++) {
            const noise = AudioManager.boostNoises[i];
            if (noise.isPlaying()) {
                if (noise.getCurrentTime() >= AudioManager.BOOST_AUDIO.getDuration()) {
                    noise.stop();
                }
            }
        }

        for (let i = 0; i < AudioManager.deathNoises.length; i++) {
            const noise = AudioManager.deathNoises[i];
            if (noise.isPlaying()) {
                if (noise.getCurrentTime() >= AudioManager.DEATH_AUDIO.getDuration()) {
                    noise.stop();
                }
            }
        }

        if (AudioManager.currentAudio && AudioManager.currentAudio._source && AudioManager.currentAudio.getCurrentTime() >= AudioManager.currentAudio._source.getDuration()) {
            if (AudioManager.NORMAL_MUSIC.includes(AudioManager.currentAudio._source)) {
                AudioManager.normalIndex = (AudioManager.normalIndex + 1) % AudioManager.NORMAL_MUSIC.length;
            }
        }

        const requestedAudio = AudioManager.getRequestedAudio();
        if (requestedAudio !== (AudioManager.currentAudio ? AudioManager.currentAudio._source : AudioManager.currentAudio)) {
            if (!AudioManager.currentAudio) {
                if (requestedAudio) {
                    AudioManager.currentAudio = requestedAudio.create();
                    AudioManager.currentAudio.play();
                } else {
                    AudioManager.currentAudio = null;
                }
            } else {
                if (AudioManager.currentAudio.getCurrentTime() < AudioManager.currentAudio._source.getDuration()) {
                    const newVolume = Math.max(AudioManager.currentAudio.getVolume() - 0.02, 0);
                    if (newVolume === 0) {
                        AudioManager.currentAudio.stop();
                        if (requestedAudio) {
                            AudioManager.currentAudio = requestedAudio.create();
                            AudioManager.currentAudio.play();
                        } else {
                            AudioManager.currentAudio = null;
                        }
                    } else {
                        AudioManager.currentAudio.setVolume(newVolume);
                    }
                } else {
                    AudioManager.currentAudio.stop();
                    if (requestedAudio) {
                        AudioManager.currentAudio = requestedAudio.create();
                        AudioManager.currentAudio.play();
                    } else {
                        AudioManager.currentAudio = null;
                    }
                }
            }
        }
    }

    static autoAdjustVolume(instance, isSelf, forceRange) {
        const scale = AudioManager.getScale();

        const positionX = instance._pannerNode.positionX.value || 0;
        const positionY = instance._pannerNode.positionY.value || 0;

        const dx = AudioManager.position.x - positionX / scale;
        const dy = AudioManager.position.y - positionY / scale;

        // well just try linear for now I guess
        const d = Math.sqrt(dx * dx + dy * dy);
        const range = forceRange || 650;
        const volume = 1 - Math.min(d / range, 1);

        if (volume === 0 && instance.isPlaying()) {
            instance.__lastTime = instance.getCurrentTime();
            instance.stop();
        }
        if (volume > 0 && !instance.isPlaying()) {
            const startTime = instance.__lastTime || 0;
            instance.play(startTime);
        }

        const mul = isSelf ? 0.25 : 0.75;

        instance.setVolume(volume * mul * 0.5);
    }

    static getRequestedAudio() {
        return AudioManager.NORMAL_MUSIC[AudioManager.normalIndex]
    }

    static playHitNoise(x, y) {
        const scale = AudioManager.getScale();

        const noise = AudioManager.hitNoises[AudioManager.hitIndex];
        AudioManager.hitIndex = (AudioManager.hitIndex + 1) % AudioManager.hitNoises.length;

        noise.setPannerPosition(x * scale, y * scale, 0);

        if (!noise.isPlaying()) {
            noise.play();
        }
        noise.seek(0);
    }

    static playBoostNoise(x, y) {
        const scale = AudioManager.getScale();

        const noise = AudioManager.boostNoises[AudioManager.boostIndex];
        AudioManager.boostIndex = (AudioManager.boostIndex + 1) % AudioManager.boostNoises.length;

        noise.setPannerPosition(x * scale, y * scale, 0);

        if (!noise.isPlaying()) {
            noise.play();
        }
        noise.seek(0);
    }

    static playDeathNoise(x, y) {
        const scale = AudioManager.getScale();

        const noise = AudioManager.deathNoises[AudioManager.deathIndex];
        AudioManager.deathIndex = (AudioManager.deathIndex + 1) % AudioManager.deathNoises.length;

        noise.setPannerPosition(x * scale, y * scale, 0);

        if (!noise.isPlaying()) {
            noise.play();
        }
        noise.seek(0);
    }
}
