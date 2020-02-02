const express = require( "express" ); 
const http = require( "http" );
const socketIO = require( "socket.io" );
const path = require( "path" );

const app = express();
const server = http.createServer( app );
const io = socketIO.listen( server );

app.use( express.static( path.join( __dirname + "/" ) ) );
server.listen( process.env.PORT || 9001, '0.0.0.0' );
console.log( "Server running on localhost:9001" );

let queueList = [];
let playerList = new Map();
let gameMap = new Map();

startGame = () => {
    let gamePlayers = [ ...queueList ];
    queueList = [];
    let roomId = gamePlayers[0];
    gameMap.set( roomId, new Map() );
    let team;

    for( let i = 0; i < gamePlayers.length; i++ ) {
        io.sockets.connected[ gamePlayers[i] ].join( roomId );
        team = i % 2 === 0 ? 'unicorn' : 'spaghetti';
        io.sockets.to( gamePlayers[i] ).emit( 'moveToGameScreen', roomId, team, Math.floor( i / 2 ) );
    }
}

updateLobby = () => {
    queueList.forEach( socketId => {
        io.sockets.to( socketId ).emit( 'updateQueue', queueList );
    } );
}

io.on( 'connection', ( socket ) => {
    console.log( 'connection made with id: ' + socket.id );
    queueList.push( socket.id );

    updateLobby();

    if( queueList.length === 4 ) {
        startGame();
    }

    socket.on( 'disconnect', () => {
        queueList = queueList.filter( item => item !== socket.id );
        playerList.delete( socket.id );
        updateLobby();
    } );
    socket.on( 'exportPlayer', ( socketId, roomId, player, team, playerNum ) => {
        gameMap.get( roomId ).set( socketId, {
            socketId: socketId,
            player: player,
            team: team,
            playerNum: playerNum
        } );
        socket.to( roomId ).emit( 'addOpponent', socketId, player, team, playerNum );
    } );
    socket.on( 'refreshPlayers', ( roomId ) => {
        gameMap.get( roomId ).forEach( player => {
            if( player.socketId !== socket.id ) {
                socket.emit( 'refreshPlayer', player.socketId, player.player, player.team, player.playerNum );
            }
        } )
    } );
    socket.on( 'exportMovement', ( socketId, roomId, x, y, animKey, animFrame ) => {
        socket.to( roomId ).emit( 'updateMovement', socketId, x, y, animKey, animFrame );
    } );
    socket.on( 'addProjectile', ( socketId, roomId, x, y, projType, direction, team ) => {
        io.in( roomId ).emit( 'addProjectileSprite', socketId, x, y, projType, direction, team );
    } );
    socket.on( 'respawnPlayer', ( socketId, roomId ) => {
        io.in( roomId ).emit( 'respawnPlayer', socketId );
    } );
    socket.on( 'paintTile', ( roomId, keyString, tileX, tileY, randomWidth, randomHeight, tileColour ) => {
        io.in( roomId ).emit( 'paintTile', keyString, tileX, tileY, randomWidth, randomHeight, tileColour );
    } );
} );
