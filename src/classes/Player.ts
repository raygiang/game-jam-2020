import { config, playerSettings } from '../constants';
import Projectile from './Projectile';
import Survival from '../scenes/Survival';
import TurfWars from '../scenes/TurfWars';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    public team: string;
    public playerNum: number;
    private facing: string;
    private reloading: boolean;
    private gameScreen: Survival | TurfWars;
    public miniMapMarker: Phaser.GameObjects.Graphics;
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
    constructor( scene: Survival | TurfWars, x: number, y: number, team: string, playerNum: number ) {
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

    restoreDepths = () => {
        this.miniMapMarker.setDepth( 1 );
        this.playerDisplayImage.setDepth( 1 );
        this.hpDisplayText.setDepth( 1 );
        this.hpDisplayBackground.setDepth( 1 );
        this.hpDisplayForeground.setDepth( 1 );
        this.ammoDisplayText.setDepth( 1 );
        this.ammoDisplayBackground.setDepth( 1 );
        this.ammoDisplayForeground.setDepth( 1 );
    }

    // Starts the player's movement and animation
    playerController = ( cursorKeys : Phaser.Types.Input.Keyboard.CursorKeys ) => {
        if( this.canMove === false ) return false;
        let diagSpd = Math.sqrt( Math.pow( playerSettings.speed, 2 ) / 2 );

        if( cursorKeys.left.isDown ) {
            if( cursorKeys.up.isDown ) {
                this.setVelocity( -diagSpd, -diagSpd );
                this.anims.resume();
                this.play( `${ this.team }-${ this.playerNum }-ul-anim`, true );
                this.facing = 'NW';
                return true;
            }
            else if( cursorKeys.down.isDown ) {
                this.setVelocity( -diagSpd, diagSpd );
                this.anims.resume();
                this.play( `${ this.team }-${ this.playerNum }-dl-anim`, true );
                this.facing = 'SW';
                return true;
            }
            else {
                this.setVelocity( -playerSettings.speed, 0 );
                this.anims.resume();
                this.play( `${ this.team }-${ this.playerNum }-left-anim`, true );
                this.facing = 'W';
                return true;
            }
        }
        else if( cursorKeys.right.isDown ) {
            if( cursorKeys.up.isDown ) {
                this.setVelocity( diagSpd, -diagSpd );
                this.anims.resume();
                this.play( `${ this.team }-${ this.playerNum }-ur-anim`, true );
                this.facing = 'NE';
                return true;
            }
            else if( cursorKeys.down.isDown ) {
                this.setVelocity( diagSpd, diagSpd );
                this.anims.resume();
                this.play( `${ this.team }-${ this.playerNum }-dr-anim`, true );
                this.facing = 'SE';
                return true;
            }
            else {
                this.setVelocity( playerSettings.speed, 0 );
                this.anims.resume();
                this.play( `${ this.team }-${ this.playerNum }-right-anim`, true );
                this.facing = 'E';
                return true;
            }
        }
        else if( cursorKeys.up.isDown ) {
            this.setVelocity( 0, -playerSettings.speed );
            this.anims.resume();
            this.play( `${ this.team }-${ this.playerNum }-up-anim`, true );
            this.facing = 'N';
            return true;
        }
        else if( cursorKeys.down.isDown ) {
            this.setVelocity( 0, playerSettings.speed );
            this.anims.resume();
            this.play( `${ this.team }-${ this.playerNum }-down-anim`, true );
            this.facing = 'S';
            return true;
        }

        return false;
    }

    shunpo = () => {
        let diagSpd = Math.sqrt( Math.pow( playerSettings.shunpoSpd, 2 ) / 2 );

        switch( this.facing ) {
            case 'W':
                this.setVelocityX( - playerSettings.shunpoSpd );
                break;
            case 'E':
                this.setVelocityX( playerSettings.shunpoSpd );
                break;
            case 'N':
                this.setVelocityY( - playerSettings.shunpoSpd );
                break;
            case 'S':
                this.setVelocityY( playerSettings.shunpoSpd );
                break;
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

        // this.scene.input.keyboard.on( 'keyup_SPACE', () => {
            // this.shunpo();
        // } );
    }

    fireProjectile = () => {
        if( this.projectilesFired < this.maxAmmo ) {
            let projType = Math.floor( Math.random() * 5 )
            if( this.gameScreen instanceof TurfWars ) {
                this.gameScreen.socket.emit( 'addProjectile', this.gameScreen.socket.id, this.gameScreen.roomId, this.x, this.y, projType, this.facing, this.team );
            }
            else {
                this.addProjectileSprite( this.x, this.y, projType, this.facing, this.team );
            }
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

    addProjectileSprite = ( x: number, y: number, projectileType: number, direction: string, team: string ) => {
        new Projectile( this.gameScreen, this.x, this.y, projectileType, direction, team );
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
        this.hpDisplayBackground.fillRect( 368, 137, ( 50 / playerSettings.hp ) * playerSettings.hp, 10 );
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
        let mapX = this.gameScreen.minimapX + ( this.x / this.gameScreen.mapWidth * this.gameScreen.minimap.width * this.gameScreen.minimapScale );
        let mapY = this.gameScreen.minimapY + ( this.y / this.gameScreen.mapHeight * this.gameScreen.minimap.height * this.gameScreen.minimapScale );
        this.minimapMarkerColour = Phaser.Display.Color.HexStringToColor( hex ).color;
        this.miniMapMarker = this.gameScreen.add.graphics();
        this.miniMapMarker.setScrollFactor( 0 );
        this.miniMapMarker.fillStyle( this.minimapMarkerColour );
        this.miniMapMarker.fillCircle( mapX, mapY, 2.5 );
    }

    updateMinimapMarker = () => {
        let mapX = this.gameScreen.minimapX + ( this.x / this.gameScreen.mapWidth * this.gameScreen.minimap.width * this.gameScreen.minimapScale );
        let mapY = this.gameScreen.minimapY + ( this.y / this.gameScreen.mapHeight * this.gameScreen.minimap.height * this.gameScreen.minimapScale );
        this.miniMapMarker.clear();
        this.miniMapMarker.fillStyle( this.minimapMarkerColour );
        this.miniMapMarker.fillCircle( mapX, mapY, 2.5 );
    }

    updateSprite = ( x: number, y: number, key: string, frame: number ) => {
        this.setPosition( x, y );
        this.anims.load( key, frame );
    }

    playerHit = () => {
        this.gameScreen.tweens.add( {
            targets: this,
            alpha: { from: 0, to: 1 },
            ease: 'Power1',
            duration: 200,
            repeat: 0,
        } );
    }

    playerDmg = ( dmg: number ) => {
        if( this.playerHP <= 0 ) return;

        this.playerHit();

        this.playerHP -= dmg;
        if( this.playerHP <= 0 ) {
            this.disableBody( true, true );
            if( this.gameScreen instanceof TurfWars ) {
                this.gameScreen.socket.emit( 'respawnPlayer', this.gameScreen.socket.id, this.gameScreen.roomId );
            }
            else {
                this.respawnPlayer
            }
        }
    }

    respawnPlayer = () => {
        let loopCounter = 0;

        this.anims.pause();
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
                if( this.miniMapMarker ) this.updateMinimapMarker();
                if( this.ammoDisplayForeground ) this.updatePlayerDisplayInfo();
            },
            onLoop: () => {
                loopCounter++;
                if( loopCounter > 15 ) this.canMove = true;
            },
            onComplete: () => {
                this.reloading = false;
                this.projectilesFired = 0;
                this.playerHP = playerSettings.hp;
                this.enableBody( false, 0, 0, true, true );
                if( this.hpDisplayForeground ) this.updatePlayerDisplayInfo();
            }
        } );
    }
}