import Survival from '../scenes/Survival';
import TurfWars from '../scenes/TurfWars';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private projType : number;
    private direction : string;
    private gameScreen : Survival | TurfWars;
    private hexColour : string;
    public team : string;
    public damagePts : number = 1;
    
    constructor( scene: Survival | TurfWars, x: number, y: number, projType: number, direction: string, team: string ) {
        super( scene, x, y, 'projectiles', ( projType + 1 ) * 13 );

        this.projType = projType;
        this.direction = direction;
        this.gameScreen = scene;
        this.team = team;
        this.hexColour = team === this.gameScreen.teamOne ? '#018bee' : '#ff2245';
        
        scene.add.existing( this );
        scene.physics.add.existing( this );

        this.setDisplaySize( this.width / 2, this.height / 2 );
        this.playAnimation();
        this.gameScreen.projectiles.add( this );
        this.gameScreen.updateProjectileColliders();
        this.fly();
    }

    // Play animation based on projectile type
    playAnimation = () => {
        let animString : string;

        switch( this.projType ) {
            case 0:
                animString = 'ball-proj-anim';
                break;
            case 1:
                animString = 'ellipse-proj-anim';
                break;
            case 2:
                animString = 'diamond-proj-anim';
                break;
            case 3:
                animString = 'star-proj-anim';
                break;
            case 4:
                animString = 'heart-proj-anim';
                break;
        }

        this.play( animString );
    }

    fly = () => {
        let xMod: number = -1;
        let yMod: number = 1;
        let dropModifier: number = 1;
        let baseVelocity: number = 400;
        let velocity: number;

        velocity = this.direction.length !== 1 ? Math.sqrt( Math.pow( baseVelocity, 2 ) / 2 ) : baseVelocity;
        if( this.direction === 'N' || this.direction === 'NE' || this.direction === 'NW' ) {
            yMod = -1;
        }
        else if( this.direction === 'E' || this.direction === 'W' ) {
            yMod = 0;
        }

        if( this.direction === 'NE' || this.direction === 'E' || this.direction === 'SE' ) {
            xMod = 1;
        }
        else if( this.direction === 'N' || this.direction === 'S' ) {
            xMod = 0;
        }

        if( this.direction === 'SW' || this.direction === 'S' || this.direction === 'SE' ) {
            dropModifier = -1;
        }

        this.setVelocity( xMod * velocity, yMod * velocity );
        this.setAcceleration( - xMod * velocity * 2, - yMod * velocity * 2 + 100 * dropModifier );
    }

    paintClosestTile = () => {
        let tileX = Math.round( this.x / this.gameScreen.tileWidth ) * this.gameScreen.tileWidth;
        let tileY = Math.round( this.y / this.gameScreen.tileWidth ) * this.gameScreen.tileWidth;
        let randomWidth = Math.floor( ( Math.random() * 16 ) + 8 );
        let randomHeight = Math.floor( ( Math.random() * 16 ) + 8 );
        let keyString = tileX + ', ' + tileY;
        let tileColour = Phaser.Display.Color.HexStringToColor( this.hexColour ).color;

        if( this.gameScreen instanceof TurfWars ) {
            this.gameScreen.socket.emit( 'paintTile', this.gameScreen.roomId, keyString, tileX, tileY, randomWidth, randomHeight, tileColour );
        }

        this.destroy();
    }

    update = () => {
        if( this.direction === 'NW' || this.direction === 'N' || this.direction === 'NE' ) {
            if( this.body.velocity.y > 100 ) {
                this.paintClosestTile();
            }
        }
        else if( this.direction === 'SW' || this.direction === 'S' || this.direction === 'SE' ) {
            if( this.body.velocity.y < -100 ) {
                this.paintClosestTile();
            }
        }
        else if( this.direction == 'E' ) {
            if( this.body.velocity.x < 0 ) {
                this.paintClosestTile();
            };
        }
        else{
            if( this.body.velocity.x > 0 ) {
                this.paintClosestTile();
            };
        }
    }
}