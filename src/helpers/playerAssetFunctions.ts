const loadPlayerAnimations = ( scene: Phaser.Scene, setType: string, playerNum: number ) => {
    scene.anims.create( {
        key: `${ setType }-${ playerNum }-left-anim`,
        frames: scene.anims.generateFrameNumbers( `${ setType }-players`, {
            start: 24 + 48 * playerNum,
            end: 29 + 48 * playerNum,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
    scene.anims.create( {
        key: `${ setType }-${ playerNum }-right-anim`,
        frames: scene.anims.generateFrameNumbers( `${ setType }-players`, {
            start: 0 + 48 * playerNum,
            end: 5 + 48 * playerNum,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
    scene.anims.create( {
        key: `${ setType }-${ playerNum }-up-anim`,
        frames: scene.anims.generateFrameNumbers( `${ setType }-players`, {
            start: 12 + 48 * playerNum,
            end: 17 + 48 * playerNum,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
    scene.anims.create( {
        key: `${ setType }-${ playerNum }-down-anim`,
        frames: scene.anims.generateFrameNumbers( `${ setType }-players`, {
            start: 42 + 48 * playerNum,
            end: 47 + 48 * playerNum,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
    scene.anims.create( {
        key: `${ setType }-${ playerNum }-ul-anim`,
        frames: scene.anims.generateFrameNumbers( `${ setType }-players`, {
            start: 18 + 48 * playerNum,
            end: 23 + 48 * playerNum,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
    scene.anims.create( {
        key: `${ setType }-${ playerNum }-ur-anim`,
        frames: scene.anims.generateFrameNumbers( `${ setType }-players`, {
            start: 6 + 48 * playerNum,
            end: 11 + 48 * playerNum,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
    scene.anims.create( {
        key: `${ setType }-${ playerNum }-dr-anim`,
        frames: scene.anims.generateFrameNumbers( `${ setType }-players`, {
            start: 36 + 48 * playerNum,
            end: 41 + 48 * playerNum,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
    scene.anims.create( {
        key: `${ setType }-${ playerNum }-dl-anim`,
        frames: scene.anims.generateFrameNumbers( `${ setType }-players`, {
            start: 30 + 48 * playerNum,
            end: 35 + 48 * playerNum,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
}

const loadProjectileAnimations = ( scene: Phaser.Scene ) => {
    scene.anims.create( {
        key: 'ball-proj-anim',
        frames: scene.anims.generateFrameNumbers( 'projectiles', {
            start: 13,
            end: 25,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
    scene.anims.create( {
        key: 'ellipse-proj-anim',
        frames: scene.anims.generateFrameNumbers( 'projectiles', {
            start: 26,
            end: 38,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
    scene.anims.create( {
        key: 'diamond-proj-anim',
        frames: scene.anims.generateFrameNumbers( 'projectiles', {
            start: 39,
            end: 51,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
    scene.anims.create( {
        key: 'star-proj-anim',
        frames: scene.anims.generateFrameNumbers( 'projectiles', {
            start: 52,
            end: 64,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
    scene.anims.create( {
        key: 'heart-proj-anim',
        frames: scene.anims.generateFrameNumbers( 'projectiles', {
            start: 65,
            end: 77,
        } ),
        frameRate: 10,
        repeat: -1,
    } );
}

export { loadPlayerAnimations, loadProjectileAnimations };