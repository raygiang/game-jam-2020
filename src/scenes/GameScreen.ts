import { config, musicConfig } from '../constants';
import Player from '../classes/Player';
import Projectile from '../classes/Projectile';

export default class GameScreen extends Phaser.Scene {

    public tileWidth : number = 16;
    public teamOne : string = 'unicorn';
    public teamTwo : string = 'spaghetti';
    private colliderOffset : number = 2;
    private cameraZoom : number = 2;
    private mapWidth : number = this.tileWidth * 75;
    private mapHeight : number = this.tileWidth * 50;
    private playerTeam : string;
    private playerNum : number;
    public roomId : string;
    public socket : any;

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
    private playerMap : Map<string, Player> = new Map();

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

    init( data ) {
        this.socket = data.socket;
        this.roomId = data.roomId;
        this.playerTeam = data.team;
        this.playerNum = data.num;
    }

    restoreDepths = () => {
        this.player.setDepth( 1 );
        this.stageForeground.setDepth( 1 );
        this.minimap.setDepth( 1 );
        this.otherPlayers.getChildren().forEach( ( player: Player ) => {
            player.miniMapMarker.setDepth( 1 );
        } );
        this.player.restoreDepths();
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
        let spawnSpots = this.playerTeam === this.teamOne ? this.teamOneSpawns : this.teamTwoSpawns;
        this.player = new Player( this, this.tileWidth * spawnSpots[this.playerNum][0], this.tileWidth * spawnSpots[this.playerNum][1], this.playerTeam, this.playerNum );
        this.cameras.main.startFollow( this.player );
        this.exportPlayer();
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
            if( proj.team !== player.team ) {
                player.playerHit();
                proj.paintClosestTile();
            }
        } );
        this.physics.add.overlap( this.projectiles, this.player, ( player: Player, proj: Projectile ) => {
            if( proj.team !== player.team ) {
                player.playerDmg( proj.damagePts );
                player.updatePlayerDisplayInfo();
                proj.paintClosestTile();
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
        // this.physics.add.collider( this.player, this.otherPlayers );
        this.physics.add.collider( this.player, this.unwalkableCells );

        this.music = this.sound.add( 'stage-music' );
        this.music.play( musicConfig );

        this.player.addMinimapMarker( '#0000FF' );
        this.player.addPlayerDisplayInfo();

        // this.player.respawnPlayer();
        this.socket.on( 'addOpponent', this.addOpponent );
        this.socket.on( 'updateMovement', this.updateMovement );
        this.socket.on( 'addProjectileSprite', this.updateProjectiles );
        this.socket.on( 'respawnPlayer', this.respawnPlayer );
        this.socket.on( 'paintTile', this.paintTile );
    }

    update = () => {
        if( this.player.playerController( this.cursorKeys ) ) {
            this.exportMovement();
        }
        this.projectiles.getChildren().forEach( projectile => {
            projectile.update();
        } );
        this.player.updateMinimapMarker();
    }

    /************************************************************************
     * SOCKET FUNCTIONS
     ************************************************************************/
    exportPlayer = () => {
        this.socket.emit( 'exportPlayer', this.socket.id, this.roomId, this.player, this.player.team, this.player.playerNum );
    }

    addOpponent = ( socketId: string, opponent: Player, team: string, playerNum: number ) => {
        console.log( 'adding ' + team + ', ' + playerNum );
        let newPlayer = new Player( this, opponent.x, opponent.y, team, playerNum );
        let miniMapColour = this.player.team === team ? '#FFFF00' : '#FF0000';
        newPlayer.addMinimapMarker( miniMapColour );
        this.playerMap.set( socketId, newPlayer );
        this.otherPlayers.add( newPlayer );
        this.restoreDepths();
    }

    exportMovement = () => {
        let animKey = this.player.anims.getCurrentKey();
        let animFrame = this.player.anims.currentFrame.index;

        this.socket.emit( 'exportMovement', this.socket.id, this.roomId, this.player.x, this.player.y, animKey, animFrame );
    }

    updateMovement = ( socketId: string, x: number, y: number, animKey: string, animFrame: number ) => {
        let opponentPlayer = this.playerMap.get( socketId );
        opponentPlayer.updateSprite( x, y, animKey, animFrame );
        opponentPlayer.updateMinimapMarker();
    }

    updateProjectiles = ( socketId: string, x: number, y: number, projType: number, direction: string, team: string ) => {
        let player = this.playerMap.get( socketId );
        player = player ? player : this.player;

        player.addProjectileSprite( x, y, projType, direction, team );
    }

    respawnPlayer = ( socketId: string ) => {
        let player = this.playerMap.get( socketId );
        player = player ? player : this.player;
        player.respawnPlayer();
    }

    paintTile = ( keyString: string, tileX: number, tileY: number, randomWidth: number, randomHeight: number, tileColour: number ) => {
        let closestTile = this.paintableTiles.get( keyString );

        if( closestTile.defaultFillColor !== tileColour ) {
            closestTile.clear();
            closestTile.defaultFillColor = tileColour;
            closestTile.fillStyle( tileColour );
            closestTile.fillEllipse( tileX, tileY, randomWidth, randomHeight, 25 );
            // closestTile.alpha = 0.85;
        }
    }
}