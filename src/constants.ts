const config = {
    title: 'Kento\'s Game',
    width: 1200,
    height: 500,
    type: Phaser.CANVAS,
    backgroundColor: '#6df7b1',
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    }
}

const playerSettings = {
    speed: 100,
    hp: 5,
    maxAmmo: 10,
    shunpoSpd: 1000,
}

const musicConfig = {
    mute: false,
    volume: 0.5,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: true,
    delay: 0,
}

export { config, playerSettings, musicConfig }