const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/user.model');
const userList = [];

function createUser(socket) {
   const userId = uuidv4();
   const user = new UserModel(userId);
   user.socket = socket;
   userList.push(user);
   return user;
}

// Function Tog Get The Current User by Id
function getUser(id) {
   return userList.find(user => user.userId === id);
}

// Function Tog Get The Current User by Id
function getUserBySocket(SocketId) {
   return userList.find(user => user.socket.id === SocketId);
}

// Function delete User by Id
function deleteUser(id) {
   const index = userList.findIndex(user => user.userId === id);

   if (index !== -1) {
      userList.splice(index, 1);
   }
}

// Function reset the User by Id
function resetUser(id) {
   const index = userList.findIndex(user => user.userId === id);

   if (index !== -1) {
      const user = userList[index];
      user.answers = [];
      user.tieBreakeranswers = [];
      user.room = null;
   }
}

module.exports = {
   createUser: createUser,
   getUser: getUser,
   getUserBySocket: getUserBySocket,
   deleteUser: deleteUser,
   resetUser: resetUser
};