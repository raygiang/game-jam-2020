import { config, playerSettings } from '../constants';
import Projectile from './Projectile';
import GameScreen from '../scenes/GameScreen';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    public team: string;
    public playerNum: number;
    private facing: string;
    private reloading: boolean;
    private gameScreen: GameScreen;
    private miniMapMarker: Phaser.GameObjects.Graphics;
    private reloadBackground: Phaser.GameObjects.Graphics;
    private reloadForeground: Phaser.GameObjects.Graphics;
    private minimapMarkerColour: number;
    private playerDisplayImage : Phaser.GameObjects.Sprite;
    private hpDisplayText : Phaser.GameObjects.Text;
    private hpDisplayBackground : Phaser.GameObjects.Graphics;
    private hpDisplayForeground : Phaser.GameObjects.Graphics;
    private ammoDisplayText : Phaser.GameObjects.Text;
    private ammoDisplayBackground : Phaser.GameObjects.Graphics;
    private ammoDisplayForeground : Phaser.GameObjects.Graphics;

    private projectilesFired: number = 0;
    private playerHP: number = playerSettings.hp;
    private maxAmmo: number = playerSettings.maxAmmo;
    private initialX: number;
    private initialY: number;
    private canMove: boolean = true;

    // Create a player corresponding the a specific team and player number
    constructor( scene: GameScreen, x: number, y: number, team: string, playerNum: number ) {
        super( scene, x, y, `${team}-players`, 42 + 48 * playerNum );

        this.team = team;
        this.playerNum = playerNum;
        this.facing = 'S';
        this.gameScreen = scene;
        this.reloadBackground = this.gameScreen.add.graphics();
        this.reloadBackground.setScrollFactor( 0 );
        this.reloadForeground = this.gameScreen.add.graphics();
        this.reloadForeground.setScrollFactor( 0 );
        this.initialX = x;
        this.initialY = y;

        scene.add.existing( this );
        scene.physics.add.existing( this );

        this.setSize( this.width / 2, this.height / 1.5 );
    }

    // Starts the player's movement and animation
    playerController = ( cursorKeys : Phaser.Types.Input.Keyboard.CursorKeys ) => {
        if( this.canMove === false ) return;
        let diagSpd = Math.sqrt( Math.pow( playerSettings.speed, 2 ) / 2 );

        if( cursorKeys.left.isDown ) {
            if( cursorKeys.up.isDown ) {
                this.setVelocity( -diagSpd, -diagSpd );
                this.anims.resume();
                this.play( `${ this.team }-${ this.playerNum }-ul-anim`, true );
                this.facing = 'NW';
            }
            else if( cursorKeys.down.isDown ) {
                this.setVelocity( -diagSpd, diagSpd );
                this.anims.resume();
                this.play( `${ this.team }-${ this.playerNum }-dl-anim`, true );
                this.facing = 'SW';
            }
            else {
                this.setVelocity( -playerSettings.speed, 0 );
                this.anims.resume();
                this.play( `${ this.team }-${ this.playerNum }-left-anim`, true );
                this.facing = 'W';
            }
        }
        else if( cursorKeys.right.isDown ) {
            if( cursorKeys.up.isDown ) {
                this.setVelocity( diagSpd, -diagSpd );
                this.anims.resume();
                this.play( `${ this.team }-${ this.playerNum }-ur-anim`, true );
                this.facing = 'NE';
            }
            else if( cursorKeys.down.isDown ) {
                this.setVelocity( diagSpd, diagSpd );
                this.anims.resume();
                this.play( `${ this.team }-${ this.playerNum }-dr-anim`, true );
                this.facing = 'SE';
            }
            else {
                this.setVelocity( playerSettings.speed, 0 );
                this.anims.resume();
                this.play( `${ this.team }-${ this.playerNum }-right-anim`, true );
                this.facing = 'E';
            }
        }
        else if( cursorKeys.up.isDown ) {
            this.setVelocity( 0, -playerSettings.speed );
            this.anims.resume();
            this.play( `${ this.team }-${ this.playerNum }-up-anim`, true );
            this.facing = 'N';
        }
        else if( cursorKeys.down.isDown ) {
            this.setVelocity( 0, playerSettings.speed );
            this.anims.resume();
            this.play( `${ this.team }-${ this.playerNum }-down-anim`, true );
            this.facing = 'S';
        }
    }

    // Stops the player's movement and animation
    initKeyListeners = ( cursorKeys : Phaser.Types.Input.Keyboard.CursorKeys ) => {
        this.scene.input.keyboard.on( 'keyup_LEFT', () => {
            this.setVelocity( 0, 0 );
            if( ! cursorKeys.right.isDown ) {
                this.anims.pause( this.scene.anims.get( `${ this.team }-${ this.playerNum }-left-anim` ).frames[0] );
            }
        } );
        this.scene.input.keyboard.on( 'keyup_RIGHT', () => {
            this.setVelocity( 0, 0 );
            if( ! cursorKeys.left.isDown ) {
                this.anims.pause( this.scene.anims.get( `${ this.team }-${ this.playerNum }-right-anim` ).frames[0] );
            }
        } );
        this.scene.input.keyboard.on( 'keyup_UP', () => {
            this.setVelocity( 0, 0 );
            if( ! cursorKeys.down.isDown ) {
                this.anims.pause( this.scene.anims.get( `${ this.team }-${ this.playerNum }-up-anim` ).frames[0] );
            }
        } );
        this.scene.input.keyboard.on( 'keyup_DOWN', () => {
            this.setVelocity( 0, 0 );
            if( ! cursorKeys.up.isDown ) {
                this.anims.pause( this.scene.anims.get( `${ this.team }-${ this.playerNum }-down-anim` ).frames[0] );
            }
        } );

        this.scene.input.keyboard.on( 'keyup_F', () => {
            this.fireProjectile();
        } );
    }

    fireProjectile = () => {
        if( this.projectilesFired < this.maxAmmo ) {
            let projectileColour = this.team === 'unicorn' ? '#018bee' : '#ff2245';
            let projectileType = Math.floor( ( Math.random() * 5 ) ); 
            new Projectile( this.gameScreen, this.x, this.y, projectileType, this.facing, projectileColour );
            this.projectilesFired++;
            this.updatePlayerDisplayInfo();
        }
        else {
            if( ! this.reloading ) {
                this.reloading = true;
                this.beginReload();
            }
        }
    }

    beginReload = () => {
        this.reloadBackground.clear();
        this.reloadForeground.clear();
        this.reloadBackground.fillStyle( 16711686 );
        this.reloadForeground.fillStyle( 16776960 );
        this.reloadBackground.fillRect( config.width / 2 - 10, config.height / 2 + 15, 20, 3 );

        let reloadTicks = 0;

        let reloadInterval = setInterval( () => {
            reloadTicks++;
            this.reloadForeground.fillRect( config.width / 2 - 10, config.height / 2 + 15, 2 * reloadTicks, 3 );
            if( reloadTicks === 10 ) {
                this.reloadBackground.clear();
                this.reloadForeground.clear();
                this.projectilesFired = 0;
                this.reloading = false;
                this.updatePlayerDisplayInfo();
                clearInterval( reloadInterval );
            }
        }, 250 );
    }
    
    addPlayerDisplayInfo = () => {
        this.playerDisplayImage = this.gameScreen.add.sprite( 318, 155, `${this.team}-players`, 42 + 48 * this.playerNum );
        this.playerDisplayImage.setScrollFactor( 0 );
        this.playerDisplayImage.setScale( 1.5 );
        this.hpDisplayText = this.gameScreen.add.text( 338, 135, 'HP:', { color: 255 } );
        this.hpDisplayText.setScrollFactor( 0 );
        this.ammoDisplayText = this.gameScreen.add.text( 338, 155, 'AMMO:', { color: 255 } );
        this.ammoDisplayText.setScrollFactor( 0 );
        this.hpDisplayBackground = this.gameScreen.add.graphics();
        this.hpDisplayBackground.setScrollFactor( 0 );
        this.hpDisplayBackground.fillStyle( 16711686 );
        this.hpDisplayBackground.fillRect( 368, 137, ( 50 / playerSettings.hp ), 10 );
        this.hpDisplayForeground = this.gameScreen.add.graphics();
        this.hpDisplayForeground.setScrollFactor( 0 );
        this.hpDisplayForeground.fillStyle( 755214 )
        this.hpDisplayForeground.fillRect( 368, 137, ( 50 / playerSettings.hp ) * this.playerHP, 10 );
        this.ammoDisplayBackground = this.gameScreen.add.graphics();
        this.ammoDisplayBackground.setScrollFactor( 0 );
        this.ammoDisplayBackground.fillStyle( 16711686 );
        this.ammoDisplayBackground.fillRect( 388, 157, ( 50 / this.maxAmmo ) * this.maxAmmo, 10 );
        this.ammoDisplayForeground = this.gameScreen.add.graphics();
        this.ammoDisplayForeground.setScrollFactor( 0 );
        this.ammoDisplayForeground.fillStyle( 16776960 )
        this.ammoDisplayForeground.fillRect( 388, 157, ( 50 / this.maxAmmo ) * ( this.maxAmmo - this.projectilesFired ), 10 );
    }

    updatePlayerDisplayInfo = () => {
        this.hpDisplayForeground.clear();
        this.hpDisplayForeground.fillStyle( 755214 );
        this.hpDisplayForeground.fillRect( 368, 137, ( 50 / playerSettings.hp ) * this.playerHP, 10 );
        this.ammoDisplayForeground.clear();
        this.ammoDisplayForeground.fillStyle( 16776960 )
        this.ammoDisplayForeground.fillRect( 388, 157, ( 50 / this.maxAmmo ) * ( this.maxAmmo - this.projectilesFired ), 10 );
    }

    addMinimapMarker = ( hex: string ) => {
        this.minimapMarkerColour = Phaser.Display.Color.HexStringToColor( hex ).color;
        this.miniMapMarker = this.gameScreen.add.graphics();
        this.miniMapMarker.setScrollFactor( 0 );
        this.miniMapMarker.fillStyle( this.minimapMarkerColour );
        // this.miniMapMarker.fillRect( 753.5 + 144 * this.x / ( this.gameScreen.tileWidth * 75 ), 125 + 96 * this.y / ( this.gameScreen.tileWidth * 50 ), 5, 5 );
        this.miniMapMarker.fillCircle( 756 + 144 * this.x / ( this.gameScreen.tileWidth * 75 ), 127 + 96 * this.y / ( this.gameScreen.tileWidth * 50 ), 2.5 );
    }

    updateMinimapMarker = () => {
        this.miniMapMarker.clear();
        this.miniMapMarker.fillStyle( this.minimapMarkerColour );
        // this.miniMapMarker.fillRect( 753.5 + 144 * this.x / ( this.gameScreen.tileWidth * 75 ), 125 + 96 * this.y / ( this.gameScreen.tileWidth * 50 ), 5, 5 );
        this.miniMapMarker.fillCircle( 756 + 144 * this.x / ( this.gameScreen.tileWidth * 75 ), 127 + 96 * this.y / ( this.gameScreen.tileWidth * 50 ), 2.5 );
    }

    playerHit = ( dmg: number ) => {
        if( this.alpha < 1 ) return;

        this.playerHP -= dmg;
        this.gameScreen.tweens.add( {
            targets: this,
            alpha: { from: 0, to: 1 },
            ease: 'Power1',
            duration: 200,
            repeat: 0,
        } );
        if( this.playerHP <= 0 ) {
            this.disableBody( true, true );
            this.respawnPlayer();
        }
    }

    respawnPlayer = () => {
        let loopCounter = 0;

        this.gameScreen.tweens.add( {
            targets: this,
            alpha: { from: 0, to: 1 },
            ease: 'Linear',
            duration: 250,
            repeat: 0,
            loop: 20,
            onStart: () => {
                this.enableBody( true, this.initialX, this.initialY, false, true );
                this.reloading = true;
                this.projectilesFired = 10;
                this.canMove = false;
            },
            onLoop: () => {
                loopCounter++;
                if( loopCounter > 15 ) this.canMove = true;
            },
            onComplete: () => {
                this.reloading = false;
                this.projectilesFired = 0;
                this.playerHP = playerSettings.hp;
            }
        } );
    }
}