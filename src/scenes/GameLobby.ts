import { config } from '../constants';
import io from 'socket.io-client';

export default class GameLobby extends Phaser.Scene {

    startButton: Phaser.GameObjects.Text;
    queueGroup: Phaser.GameObjects.Group;
    socket;

    constructor() {
        super( 'GameLobby' );
    }

    updateQueue = ( queueList ) => {
        let x = config.width / 2 - 210;
        let y = config.height / 2 - 50;

        this.queueGroup.clear( true, true );

        for( let i = 0; i < queueList.length; i++ ) {
            this.queueGroup.add( this.add.text( x, y + 55 * i, queueList[i], { fontSize: 30 } ) );
        }
    }

    startGame = ( roomId: string, team: string, num: number ) => {
        this.scene.start( 'TurfWars', { socket: this.socket, roomId: roomId, team: team, num : num } );
    }

    preload = () => {
        this.cameras.main.setBackgroundColor( 0 );
        this.socket = io.connect();
    }

    create = () => {
        this.queueGroup = this.add.group();

        this.startButton = this.add.text( config.width / 2 - 210, config.height / 2 - 150, 'Waiting Lobby', { fontSize: 60 } );
    
        this.socket.on( 'updateQueue', this.updateQueue );
        this.socket.on( 'moveToGameScreen', this.startGame );
    }
}