const { v4: uuidv4 } = require('uuid');
const RoomModel = require('../models/room.model')
var singleRoom = null;
const FullRoomList = [];

function createRoom(user) {
    const roomId = `room-${uuidv4()}`;
    const room = new RoomModel(roomId);
    room.user1 = user;
    singleRoom = room;
    return { room: room, action:'new_room_created' };
}
function joinRoom(user) {
    if (singleRoom) {
        const room = singleRoom;
        room.user2 = user;
        FullRoomList.push(room);
        singleRoom = null;
        return { room:room, action:'old_room_joined' };
    }else {
        return createRoom(user);
    }
}

// Function Tog Get The Current Room by Id
function getFullRoom(id) {
    return FullRoomList.find(room => room.roomId === id);
}

// Function Tog Get The delete Room by Id
function deleteFullRoom(id) {
    const index = FullRoomList.findIndex(room => room.roomId === id);

    if (index !== -1) {
        FullRoomList.splice(index, 1);
    }
}

module.exports = {
    joinRoom: joinRoom,
    getFullRoom: getFullRoom,
    deleteFullRoom: deleteFullRoom
};