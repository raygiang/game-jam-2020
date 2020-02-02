import { config } from '../constants';
import io from 'socket.io-client';

export default class GameLobby extends Phaser.Scene {

    startButton: Phaser.GameObjects.Text;
    socket;

    constructor() {
        super( 'GameLobby' );
    }

    startGame = ( roomId: string, team: string, num: number ) => {
        this.scene.start( 'GameScreen', { socket: this.socket, roomId: roomId, team: team, num : num } );
    }

    preload = () => {
        this.cameras.main.setBackgroundColor( 0 );
        this.socket = io.connect( 'localhost:9001' );
    }

    create = () => {
        this.startButton = this.add.text( config.width / 2 - 190, config.height / 2 - 30, 'Lobby', { fontSize: 60 } );
    
        this.socket.on( 'moveToGameScreen', this.startGame );
    }
}