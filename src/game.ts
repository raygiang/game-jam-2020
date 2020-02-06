import 'phaser';
import StartScreen from './scenes/StartScreen';
import GameLobby from './scenes/GameLobby';
import Survival from './scenes/Survival';
import TurfWars from './scenes/TurfWars';
import { config } from './constants';
import { loadPlayerAnimations, loadProjectileAnimations, loadTurfWarsStageOne } from './helpers/assetFunctions';

window.addEventListener( 'load', () => {
	const game = new Phaser.Game( config );
    
    game.scene.add( 'Boot', Boot, true );
    game.scene.add( 'StartScreen', StartScreen, false );
    game.scene.add( 'GameLobby', GameLobby, false );
    game.scene.add( 'Survival', Survival, false );
    game.scene.add( 'TurfWars', TurfWars, false );

    // console.log( Phaser.Core.TimeStep.forceSetTimeOut );
    game.events.off( 'hidden' );
} );

class Boot extends Phaser.Scene {

    initAnimations = () => {
        loadPlayerAnimations( this, 'unicorn', 0 );
        loadPlayerAnimations( this, 'unicorn', 1 );
        loadPlayerAnimations( this, 'unicorn', 2 );
        loadPlayerAnimations( this, 'unicorn', 3 );
        loadPlayerAnimations( this, 'spaghetti', 0 );
        loadPlayerAnimations( this, 'spaghetti', 1 );
        loadPlayerAnimations( this, 'spaghetti', 2 );
        loadPlayerAnimations( this, 'spaghetti', 3 );
        loadProjectileAnimations( this );
    }

	preload() {
        this.cameras.main.setBackgroundColor( 0 );
        this.add.text( config.width / 2 - 260, config.height / 2 - 30, 'Loading Game...', { fontSize: 60 } );

        this.load.setBaseURL( 'assets/' );

        loadTurfWarsStageOne( this );

        this.load.spritesheet( 'unicorn-players', 'unicorn-atlas.png', {
            frameWidth: 16,
            frameHeight: 32,
        } );
        this.load.spritesheet( 'spaghetti-players', 'spaghetti_atlas.png', {
            frameWidth: 16,
            frameHeight: 32,
        } );
        this.load.spritesheet( 'projectiles', 'projectiles.png', {
            frameWidth: 16,
            frameHeight: 16,
        } );

        this.load.audio( 'survival-music', 'audio/celestial.mp3' );
        this.load.audio( 'turf-wars-music', 'audio/foggy-woods.mp3' );

        this.load.image( 'survival-1-map', 'survival-stages/survival-1.png' )
        this.load.image( 'tilemap_packed', 'survival-stages/tilemap_packed.png' );
        this.load.tilemapTiledJSON( 'survival-1', 'survival-stages/survival-1.json' );
	}

	create() {
        this.initAnimations();

		this.scene.start( 'StartScreen' );
	}

}
