import { config, playerSettings } from '../constants';
import Projectile from './Projectile';
import GameScreen from '../scenes/GameScreen';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    public team: string;
    public playerNum: number;
    private facing: string;
    private reloading: boolean;
    // private playerProjectiles: Phaser.Physics.Arcade.Group;
    private gameScreen: GameScreen;
    private miniMapMarker: Phaser.GameObjects.Graphics;
    private reloadBackground: Phaser.GameObjects.Graphics;
    private reloadForeground: Phaser.GameObjects.Graphics;
    private minimapMarkerColour: number;
    private projectilesFired: number = 0;

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

        scene.add.existing( this );
        scene.physics.add.existing( this );

        this.setSize( this.width / 2, this.height / 1.5 );
    }

    // Starts the player's movement and animation
    playerController = ( cursorKeys : Phaser.Types.Input.Keyboard.CursorKeys ) => {
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
        if( this.projectilesFired < 10 ) {
            let projectileColour = this.team === 'unicorn' ? '#018bee' : '#ff2245';
            let projectileType = Math.floor( ( Math.random() * 5 ) ); 
            new Projectile( this.gameScreen, this.x, this.y, projectileType, this.facing, projectileColour );
            this.projectilesFired++;
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
        this.reloadForeground.fillStyle( 40527 );
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
                clearInterval( reloadInterval );
            }
        }, 250 );
    }

    addMinimapMarker = ( hex: string ) => {
        this.minimapMarkerColour = Phaser.Display.Color.HexStringToColor( hex ).color;
        this.miniMapMarker = this.gameScreen.add.graphics();
        this.miniMapMarker.setScrollFactor( 0 );
        this.miniMapMarker.fillStyle( this.minimapMarkerColour );
        this.miniMapMarker.fillRect( 753.5 + 144 * this.x / ( this.gameScreen.tileWidth * 75 ), 125 + 96 * this.y / ( this.gameScreen.tileWidth * 50 ), 5, 5 );
    }

    updateMinimapMarker = () => {
        this.miniMapMarker.clear();
        this.miniMapMarker.fillStyle( this.minimapMarkerColour );
        this.miniMapMarker.fillRect( 753.5 + 144 * this.x / ( this.gameScreen.tileWidth * 75 ), 125 + 96 * this.y / ( this.gameScreen.tileWidth * 50 ), 5, 5 );
    }

    playerHit = () => {
        this.alpha = 0.1;
        this.gameScreen.tweens.add( {
            targets: this,
            ease: 'Power2',
            duration: 500,
            repeat: 0,
            onComplete: () => { this.alpha = 1 },
        } );
    }
}