import { config } from '../constants';
export default class StartScreen extends Phaser.Scene {

    startButton: Phaser.GameObjects.Text;

    constructor() {
        super( 'StartScreen' );
    }

    startGame = () => {
        this.scene.start( 'GameLobby' );
    }

    preload = () => {
        this.cameras.main.setBackgroundColor( 0 );
    }

    create = () => {
        this.startButton = this.add.text( config.width / 2 - 190, config.height / 2 - 30, 'Start Game', { fontSize: 60 } );
        this.startButton.setInteractive();
        this.startButton.on( 'pointerover', () => {
            this.startButton.setColor( '#FF0000' );
        } )
        this.startButton.on( 'pointerout', () => {
            this.startButton.setColor( '#FFF' );
        } )
        this.startButton.on( 'pointerdown', () => {
            this.startGame();
        } )
    }
}