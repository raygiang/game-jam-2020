import { config } from '../constants';
export default class StartScreen extends Phaser.Scene {

    singlePlayerButton: Phaser.GameObjects.Text;
    turfWarsButton: Phaser.GameObjects.Text;

    constructor() {
        super( 'StartScreen' );
    }

    startSinglePlayer = () => {
        this.scene.start( 'Survival' );
    }

    startTurfWars = () => {
        this.scene.start( 'GameLobby' );
    }

    preload = () => {
        this.cameras.main.setBackgroundColor( 0 );
    }

    addSinglePlayerButton = () => {
        this.singlePlayerButton = this.add.text( config.width / 2 - 330, config.height / 2 - 80, 'Start Single Player', { fontSize: 60 } );
        this.singlePlayerButton.setInteractive();
        this.singlePlayerButton.on( 'pointerover', () => {
            this.singlePlayerButton.setColor( '#FF0000' );
        } )
        this.singlePlayerButton.on( 'pointerout', () => {
            this.singlePlayerButton.setColor( '#FFF' );
        } )
        this.singlePlayerButton.on( 'pointerdown', () => {
            this.startSinglePlayer();
        } )
    }

    addTurfWarsButton = () => {
        this.turfWarsButton = this.add.text( config.width / 2 - 250, config.height / 2 - 10, 'Join Turf Wars', { fontSize: 60 } );
        this.turfWarsButton.setInteractive();
        this.turfWarsButton.on( 'pointerover', () => {
            this.turfWarsButton.setColor( '#FF0000' );
        } )
        this.turfWarsButton.on( 'pointerout', () => {
            this.turfWarsButton.setColor( '#FFF' );
        } )
        this.turfWarsButton.on( 'pointerdown', () => {
            this.startTurfWars();
        } )
    }

    create = () => {
        this.addSinglePlayerButton();
        this.addTurfWarsButton(); 
    }
}