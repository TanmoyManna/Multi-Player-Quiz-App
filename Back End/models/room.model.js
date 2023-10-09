class Room {
    constructor(roomid) {
        this.roomId = roomid;
        this.user1;
        this.user2;
        this.questions;

        this.user1ScoreList;
        this.user1TotalScore;

        this.user2ScoreList;
        this.user2TotalScore;

        this.tieBreakerquestions;


    }
}
// Export this module
module.exports = Room