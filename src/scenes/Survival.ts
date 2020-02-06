import { config, musicConfig } from '../constants';
import Player from '../classes/Player';
import Projectile from '../classes/Projectile';

export default class Survival extends Phaser.Scene {

    public tileWidth : number = 16;
    public teamOne : string = 'unicorn';
    public teamTwo : string = 'spaghetti';
    public mapWidth : number;
    public mapHeight : number;
    private cameraZoom : number = 2;
    private playerTeam : string = 'unicorn';
    private playerNum : number = 0;

    private tilemap : Phaser.Tilemaps.Tilemap;
    private stageBorder : Phaser.Tilemaps.StaticTilemapLayer;
    private stageBase : Phaser.Tilemaps.StaticTilemapLayer;
    private stageForeground : Phaser.Tilemaps.StaticTilemapLayer;
    private stageColliders : Phaser.Tilemaps.DynamicTilemapLayer;
    private stageUnwalkables : Phaser.Tilemaps.DynamicTilemapLayer;
    private playerSpawns : Phaser.Tilemaps.StaticTilemapLayer;
    private enemySpawns : Phaser.Tilemaps.StaticTilemapLayer;
    public minimap : Phaser.GameObjects.Image;
    public minimapX : number;
    public minimapY : number;
    public minimapScale : number = 0.08;
    private spawnSpots : number[][] = [];

    private player : Player;
    private music : Phaser.Sound.BaseSound;
    private cursorKeys : Phaser.Types.Input.Keyboard.CursorKeys;
    private enemies : Phaser.Physics.Arcade.Group;
    public projectiles : Phaser.Physics.Arcade.Group;

    constructor() {
        super( 'Survival' );
    }

    findSpawnSpots = () => {
        this.playerSpawns.layer.data.forEach( row => {
            row.forEach( cell => {
                if( cell.index != -1 ) {
                    this.spawnSpots.push( [ cell.x, cell.y ] );
                }
            } )
        } );
    }

    initStage = () => {
        this.tilemap = this.add.tilemap( 'survival-1' );
        this.tilemap.addTilesetImage( 'tilemap_packed' );
        this.mapWidth = this.tilemap.width * this.tileWidth;
        this.mapHeight = this.tilemap.height * this.tileWidth;
        this.stageColliders = this.tilemap.createDynamicLayer( 'collision', 'tilemap_packed', 0, 0 );
        this.stageColliders.setCollisionByExclusion( [-1] );
        if( this.tilemap.getLayer( 'unwalkable' ) ) { 
            this.stageUnwalkables = this.tilemap.createDynamicLayer( 'unwalkable', 'tilemap_packed', 0, 0 );
            this.stageUnwalkables.setCollisionByExclusion( [-1] );
        }
        this.playerSpawns = this.tilemap.createStaticLayer( 'player_spawns', 'tilemap_packed', 0, 0 );
        this.enemySpawns = this.tilemap.createStaticLayer( 'enemy_spawns', 'tilemap_packed', 0, 0 );
        this.stageBorder = this.tilemap.createStaticLayer( 'border', 'tilemap_packed', 0, 0 )
        this.stageBase = this.tilemap.createStaticLayer( 'base', 'tilemap_packed', 0, 0 );
        this.findSpawnSpots();
        
        this.initPlayer();
        
        this.tilemap.createStaticLayer( 'foreground', 'tilemap_packed', 0, 0 );

        this.cameras.main.zoom = this.cameraZoom;
    }

    initPlayer = () => {
        let spawnX = this.tileWidth * this.spawnSpots[this.playerNum][0] + this.tileWidth / 2;
        let spawnY = this.tileWidth * this.spawnSpots[this.playerNum][0] + this.tileWidth / 2;
        this.player = new Player( this, spawnX, spawnY, this.playerTeam, this.playerNum );
        this.cameras.main.startFollow( this.player );
    }

    initMiniMap = () => {
        this.minimap = this.add.image( 0, 0, 'survival-1-map' );
        this.minimapX = config.width * 0.75 - this.minimap.width * this.minimapScale;
        this.minimapY = ( config.height - config.height * 0.75 );
        this.minimap.setOrigin( 0, 0 );
        this.minimap.setPosition( this.minimapX, this.minimapY );
        this.minimap.alpha = 0.75;
        this.minimap.setScale( this.minimapScale );
        this.minimap.setScrollFactor( 0 );
    }
    
    updateProjectileColliders = () => {
        this.physics.add.collider( this.projectiles, this.stageColliders, ( proj: Projectile, coll ) => {
            proj.destroy();
        } );
        this.physics.add.overlap( this.projectiles, this.enemies, ( proj: Projectile, player: Player ) => {
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
        this.cameras.main.setBackgroundColor( 3722155 );

        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.projectiles = this.physics.add.group();
    }

    create = () => {
        // this.initColliders();
        this.initStage();
        this.initMiniMap();
        this.player.initKeyListeners( this.cursorKeys );
        
        this.physics.add.collider( this.player, this.stageColliders );
        this.physics.add.collider( this.player, this.stageUnwalkables );

        this.music = this.sound.add( 'survival-music' );
        this.music.play( musicConfig );

        this.player.addMinimapMarker( '#0000FF' );
        this.player.addPlayerDisplayInfo();

        // this.game.events.on( 'visible', this.submitRefreshRequest );
        // this.game.events.on( 'hidden', this.hidePlayer );
    }

    update = () => {
        this.player.playerController( this.cursorKeys );

        this.projectiles.getChildren().forEach( projectile => {
            projectile.update();
        } );
        this.player.updateMinimapMarker();
    }

    updateProjectiles = ( x: number, y: number, projType: number, direction: string, team: string ) => {
        this.player.addProjectileSprite( x, y, projType, direction, team );
    }
}