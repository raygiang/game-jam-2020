import 'phaser';
import StartScreen from './scenes/StartScreen';
import GameLobby from './scenes/GameLobby';
import GameScreen from './scenes/GameScreen';
import { config } from './constants';
import { loadPlayerAnimations, loadProjectileAnimations } from './helpers/playerAssetFunctions';

window.addEventListener( 'load', () => {
	const game = new Phaser.Game( config );
    
    game.scene.add( 'Boot', Boot, true );
    game.scene.add( 'StartScreen', StartScreen, false );
    game.scene.add( 'GameLobby', GameLobby, false );
    game.scene.add( 'GameScreen', GameScreen, false );

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
        this.load.image( 'stage-1', '/stages/stage-1/stage-1.jpg' );
        this.load.image( 'stage-1-base', '/stages/stage-1/base.png' );
        this.load.image( 'stage-1-foreground', '/stages/stage-1/foreground.png' );
        this.load.image( 'stage-1-subground', '/stages/stage-1/subground.png' );
        this.load.tilemapCSV( 'stage-1-collision', 'stages/stage-1/collision.csv' );
        this.load.tilemapCSV( 'stage-1-unwalkable', 'stages/stage-1/unwalkable.csv' );
        this.load.tilemapCSV( 'stage-1-spawn-1', 'stages/stage-1/team-1-spawn.csv' );
        this.load.tilemapCSV( 'stage-1-spawn-2', 'stages/stage-1/team-2-spawn.csv' );

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

        this.load.audio( 'stage-music', 'audio/foggy-woods.mp3' );
	}

	create() {
        this.initAnimations();

		this.scene.start( 'StartScreen' );
	}

}
