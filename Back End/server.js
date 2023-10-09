// This will be the starting point of the application

// Importing Config Files
const serverConfig = require("./configs/server.config");

// Importing express framework,socket.io and creating a server
const express = require("express");
const app = express();
const http = require('http');
let options = {
  allowEIO3: true,
  cors: {
    origins: '*',
    transports: ['websocket', 'polling'],
  }
};
const server = http.createServer(app, options);
const socketIO = require('socket.io');
const io = socketIO(server);


// Importing bodyParser and using it in app To convert JSON to Js Objects and vice versa
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Importing room and user controller
const UserController = require('./controllers/user.controller');
const RoomController = require('./controllers/room.controller');

// Importing utils
const QuestionHelper = require("./utils/fetchQuestion");
const WinnerHelper = require("./utils/calculateWinner");

// To start  our server
server.listen(serverConfig.PORT, async () => {
  console.log(`Server started on port ${serverConfig.PORT}`);
});

io.on('connection', (socket) => {
  console.log('A user connected');

  const newUser = UserController.createUser(socket);
  newUser.socket.emit('userId', newUser.userId);

  socket.on('startquiz', async (userId) => {
    const res = RoomController.joinRoom(userId);
    if (res.action == 'new_room_created') {
      const User = UserController.getUser(userId);
      User.roomId = res.room.roomId;

      User.socket.join(res.room.roomId);
      User.socket.emit('waitingForPlayer');
    } else {
      const User = UserController.getUser(userId);
      User.roomId = res.room.roomId;
      User.socket.join(res.room.roomId);
      UserController.getUser(res.room.user1).socket.emit('userJoined', userId);
      User.socket.emit('roomJoined', res.room.roomId);


      const quesions = await QuestionHelper.getQuestion(5);
      res.room.questions = quesions;

      io.to(res.room.roomId).emit('questions', quesions);
    }
  })

  socket.on('answers', async (answerList, userId) => {
    const User = UserController.getUser(userId);
    User.answers = [...answerList];

    const Room = RoomController.getFullRoom(User.roomId);

    if (UserController.getUser(Room.user1).answers.length > 0 && UserController.getUser(Room.user2).answers.length > 0) {
      io.to(Room.roomId).emit('calculating');

      const res = await WinnerHelper.calculate(Room.roomId);
      if (res.result == 'got_winner') {
        res.winner.socket.emit('result', { result: "You Won", scoreCard: res.winnerScoreList });
        res.looser.socket.emit('result', { result: "You Loose", scoreCard: res.looserScoreList });

        UserController.resetUser(res.winner.userId);
        UserController.resetUser(res.looser.userId);
        RoomController.deleteFullRoom(Room.roomId);

      } else if (res.result == 'draw') {
        io.to(Room.roomId).emit('tieBreaker');

        const quesion = await QuestionHelper.getQuestion(1);
        Room.tieBreakerquestions = quesion;

        io.to(Room.roomId).emit('tieBreakerQuestion', quesion[0]);
      }
    } else {
      User.socket.emit('waitingForOpponent');
    }
  });

  socket.on('tieBreakerAswers', async (answer, userId) => {
    console.log(answer)
    const User = UserController.getUser(userId);
    User.tieBreakeranswer = answer;

    const Room = RoomController.getFullRoom(User.roomId);

    if (UserController.getUser(Room.user1).tieBreakeranswer && UserController.getUser(Room.user2).tieBreakeranswer) {
      const res = await WinnerHelper.calculateTieBreaker(Room.roomId);
      if (res.result == 'got_winner') {
        res.winner.socket.emit('result', { result: "You Won On Tie Breaker", scoreCard: res.winnerScoreList });
        res.looser.socket.emit('result', { result: "You Loose On Tie Breaker", scoreCard: res.looserScoreList });

        UserController.resetUser(res.winner.userId);
        UserController.resetUser(res.looser.userId);
        RoomController.deleteFullRoom(Room.roomId);

      } else if (res.result == 'draw') {
        const quesion = await QuestionHelper.getQuestion(1);
        Room.tieBreakerquestions = quesion[0];

        UserController.getUser(Room.user1).tieBreakeranswer = null;
        UserController.getUser(Room.user2).tieBreakeranswer = null


        io.to(Room.roomId).emit('tieBreakerQuestion', quesion[0]);
      }
    } else {
      User.socket.emit('waitingForOpponent');
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');

    const disconnectedUser = UserController.getUserBySocket(socket.id);

    if (disconnectedUser.roomId) {
      const Room = RoomController.getFullRoom(disconnectedUser.roomId);
      if (Room) {
        if (disconnectedUser.userId == Room.user1 && Room.user2) {
          const otherUser = UserController.getUser(Room.user2);
          otherUser.socket.emit('result', { result: "You Won Cause Your Opponent Left" });
          UserController.resetUser(otherUser.userId);
        } else if (Room.user2 && disconnectedUser.userId == Room.user2) {
          const otherUser = UserController.getUser(Room.user1);
          otherUser.socket.emit('result', { result: "You Won Cause Your Opponent Left" });
          UserController.resetUser(otherUser.userId);
        }
        RoomController.deleteFullRoom(Room.roomId);
      }
    }
    UserController.deleteUser(disconnectedUser.userId);
  });
});