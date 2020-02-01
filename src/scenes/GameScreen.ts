import { config, musicConfig } from '../constants';
import Player from '../classes/Player';
import Projectile from '../classes/Projectile';

export default class GameScreen extends Phaser.Scene {

    public tileWidth : number = 16;
    private teamOne : string = 'unicorn';
    private teamTwo : string = 'spaghetti';
    private colliderOffset : number = 2;
    private cameraZoom : number = 2;
    private mapWidth : number = this.tileWidth * 75;
    private mapHeight : number = this.tileWidth * 50;
    private playerTeam : string = this.teamTwo;
    private playerNum : number = 2;

    private stageBase : Phaser.GameObjects.Image;
    private stageSubground : Phaser.GameObjects.Image;
    private stageForeground : Phaser.GameObjects.Image;
    public minimap : Phaser.GameObjects.Image;
    private collisions : Phaser.Tilemaps.Tile[][];
    private unwalkables : Phaser.Tilemaps.Tile[][];
    private spawnMapOne : Phaser.Tilemaps.Tile[][];
    private spawnMapTwo : Phaser.Tilemaps.Tile[][];
    private teamOneSpawns : number[][] = [];
    private teamTwoSpawns : number[][] = [];
    public paintableTiles : Map<string, Phaser.GameObjects.Graphics> = new Map();

    private player : Player;
    private music : Phaser.Sound.BaseSound;
    private cursorKeys : Phaser.Types.Input.Keyboard.CursorKeys;
    private colliderCells : Phaser.Physics.Arcade.Group;
    private unwalkableCells : Phaser.Physics.Arcade.Group;
    private otherPlayers : Phaser.Physics.Arcade.Group;
    public projectiles : Phaser.Physics.Arcade.Group;

    constructor() {
        super( 'GameScreen' );
    }

    findSpawnSpots = () => {
        this.spawnMapOne.forEach( row => {
            row.forEach( cell => {
                if( cell.index != -1 ) {
                    this.teamOneSpawns.push( [ cell.x, cell.y ] );
                }
            } )
        } );

        this.spawnMapTwo.forEach( row => {
            row.forEach( cell => {
                if( cell.index != -1 ) {
                    this.teamTwoSpawns.push( [ cell.x, cell.y ] );
                }
            } )
        } );
    }

    initStage = () => {
        this.stageBase = this.add.image( 0, 0, 'stage-1-base' );
        this.stageBase.setOrigin( 0, 0 );
        this.initPaintableTiles();
        
        this.stageSubground = this.add.image( 0, 0, 'stage-1-subground' );
        this.stageSubground.setOrigin( 0, 0 );

        this.initPlayer();

        this.stageForeground = this.add.image( 0, 0, 'stage-1-foreground' );
        this.stageForeground.setOrigin( 0, 0 );

        this.cameras.main.zoom = this.cameraZoom;
    }

    initPlayer = () => {
        for( let i = 0; i < 2; i++ ) {
            for( let j = 0; j < 4; j++ ) {
                let team = i === 0 ? this.teamOne : this.teamTwo;
                let spawns = i === 0 ? this.teamOneSpawns : this.teamTwoSpawns;
                
                if( ! ( team === this.playerTeam && j === this.playerNum ) ) {
                    let newPlayer = new Player( this, this.tileWidth * spawns[j][0], this.tileWidth * spawns[j][1], team, j );;
                    this.otherPlayers.add( newPlayer );
                }
            }
        }

        let spawnSpots = this.playerTeam === this.teamOne ? this.teamOneSpawns : this.teamTwoSpawns;
        this.player = new Player( this, this.tileWidth * spawnSpots[this.playerNum][0], this.tileWidth * spawnSpots[this.playerNum][1], this.playerTeam, this.playerNum );
        this.cameras.main.startFollow( this.player );
    }

    initColliders = () => {
        this.colliderCells = this.physics.add.group();
        this.unwalkableCells = this.physics.add.group();
        this.otherPlayers = this.physics.add.group();

        this.collisions.forEach( row => {
            row.forEach( cell => {
                if( cell.index != -1 ) {
                    let newCollider = this.colliderCells.create( ( ( cell.x + 1 ) * this.tileWidth ) + this.colliderOffset * 2, ( cell.y + 1 ) * this.tileWidth, null );
                    newCollider.body.setSize( this.tileWidth - this.colliderOffset, this.tileWidth - this.colliderOffset, 0, 0 );
                    newCollider.alpha = 0;
                    newCollider.body.moves = false;
                    newCollider.body.immovable = true;
                    this.colliderCells.add( newCollider );
                }
            } );
        } );

        this.unwalkables.forEach( row => {
            row.forEach( cell => {
                if( cell.index != -1 ) {
                    let newUnwalkable = this.unwalkableCells.create( ( ( cell.x + 1 ) * this.tileWidth ) + this.colliderOffset * 2, ( cell.y + 1 ) * this.tileWidth, null );
                    newUnwalkable.body.setSize( this.tileWidth - this.colliderOffset, this.tileWidth - this.colliderOffset, 0, 0 );
                    newUnwalkable.alpha = 0;
                    newUnwalkable.body.moves = false;
                    newUnwalkable.body.immovable = true;
                    this.unwalkableCells.add( newUnwalkable );
                }
            } );
        } );
    }

    initMiniMap = () => {
        this.minimap = this.add.image( 755, 125, 'stage-1' );
        this.minimap.setOrigin( 0, 0 );
        this.minimap.alpha = 0.75;
        this.minimap.setScale( 0.12 );
        this.minimap.setScrollFactor( 0 );
    }

    initPaintableTiles = () => {
        for( let i = 0; i < this.mapWidth; i+= this.tileWidth ) {
            for( let j = 0; j < this.mapHeight; j += this.tileWidth ) {
                let keyString = i + ', ' + j;
                this.paintableTiles.set( keyString, this.add.graphics() );
            }
        }
    }
    
    updateProjectileColliders = () => {
        this.physics.add.collider( this.projectiles, this.colliderCells, ( proj: Projectile, coll ) => {
            proj.paintClosestTile();
        } );
        this.physics.add.overlap( this.projectiles, this.otherPlayers, ( proj: Projectile, player: Player ) => {
            if( player.team !== this.playerTeam ) {
                proj.paintClosestTile();
                player.playerHit();
            }
        } );
    }

    preload = () => {
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.projectiles = this.physics.add.group();

        this.collisions = this.add.tilemap( 'stage-1-collision' ).layers[0].data;
        this.unwalkables = this.add.tilemap( 'stage-1-unwalkable' ).layers[0].data;
        this.spawnMapOne = this.add.tilemap( 'stage-1-spawn-1' ).layers[0].data;
        this.spawnMapTwo = this.add.tilemap( 'stage-1-spawn-2' ).layers[0].data;

        this.findSpawnSpots();
    }

    create = () => {
        this.initColliders();
        this.initStage();
        this.initMiniMap();
        this.player.initKeyListeners( this.cursorKeys );
        
        this.physics.add.collider( this.player, this.colliderCells );
        this.physics.add.collider( this.player, this.unwalkableCells );
        this.physics.add.collider( this.otherPlayers, this.otherPlayers );
        this.physics.add.collider( this.otherPlayers, this.colliderCells );
        this.physics.add.collider( this.otherPlayers, this.unwalkableCells );

        this.music = this.sound.add( 'stage-music' );
        this.music.play( musicConfig );

        this.otherPlayers.getChildren().forEach( ( player: Player ) => {
            if( player.team === this.playerTeam && player.playerNum !== this.playerNum ) {
                player.addMinimapMarker( '#FFFF00' );
            }
            else {
                player.addMinimapMarker( '#FF0000' );
            }
        } );
        this.player.addMinimapMarker( '#0000FF' );
    }

    update = () => {
        this.player.playerController( this.cursorKeys );
        this.projectiles.getChildren().forEach( projectile => {
            projectile.update();
        } );
        this.otherPlayers.getChildren().forEach( ( player: Player ) => {
            player.updateMinimapMarker();
        } );
        this.player.updateMinimapMarker();
    }
}