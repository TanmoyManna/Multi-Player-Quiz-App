// Importing room and user controller
const UserController = require('../controllers/user.controller');
const RoomController = require('../controllers/room.controller');

function calculate(roomId) {
    return new Promise((resolve) => {
        const Room = RoomController.getFullRoom(roomId);
        const user1 = UserController.getUser(Room.user1);
        const user2 = UserController.getUser(Room.user2);

        const user1ScoreList = [];
        let user1TotalScore = 0;
        const user2ScoreList = [];
        let user2TotalScore = 0;
        Room.questions.forEach((element, index) => {
            if (user1.answers[index] == 'pass') {
                user1ScoreList.push(0);
            } else if (user1.answers[index] == element.correct_answer) {
                user1ScoreList.push(5);
                user1TotalScore += 5;
            } else {
                user1ScoreList.push(-2);
                user1TotalScore -= 2;
            }


            if (user2.answers[index] == 'pass') {
                user2ScoreList.push(0);
            } else if (user2.answers[index] == element.correct_answer) {
                user2ScoreList.push(5);
                user2TotalScore += 5;
            } else {
                user2ScoreList.push(-2);
                user2TotalScore -= 2;
            }
        });

        Room.user1ScoreList = [...user1ScoreList];
        Room.user1TotalScore = user1TotalScore;

        Room.user2ScoreList = [...user2ScoreList];
        Room.user2TotalScore = user2TotalScore;

        if (user1TotalScore == user2TotalScore) {
            resolve({ result: 'draw' })
        } else if (user1TotalScore > user2TotalScore) {
            resolve({ result: 'got_winner', winner: user1, looser: user2, winnerScoreList: user1ScoreList, looserScoreList: user2ScoreList })
        } else {
            resolve({ result: 'got_winner', winner: user2, looser: user1, winnerScoreList: user2ScoreList, looserScoreList: user1ScoreList })
        }

    });
};


function calculateTieBreaker(roomId) {
    return new Promise((resolve) => {
        const Room = RoomController.getFullRoom(roomId);
        const user1 = UserController.getUser(Room.user1);
        const user2 = UserController.getUser(Room.user2);

        let user1Score = 0;
        let user2Score = 0;
        
        if (user1.tieBreakeranswer == Room.tieBreakerquestions.correct_answer) {
            user1Score += 1;
        }

        if (user2.tieBreakeranswer == Room.tieBreakerquestions.correct_answer) {
            user2Score += 1;
        }

        if (user1Score == user2Score) {
            resolve({ result: 'draw' })
        } else if (user1Score > user2Score) {
            resolve({ result: 'got_winner', winner: user1, looser: user2, winnerScoreList: Room.user1ScoreList, looserScoreList: Room.user2ScoreList })
        } else {
            resolve({ result: 'got_winner', winner: user2, looser: user1, winnerScoreList: Room.user2ScoreList, looserScoreList: Room.user1ScoreList })
        }

    });
};

module.exports = {
    calculate: calculate,
    calculateTieBreaker: calculateTieBreaker
};