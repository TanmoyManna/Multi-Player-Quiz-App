class User {
    constructor(userid) {
        this.userId = userid;
        this.socket;
        this.roomId;        
        this.answers = [];
        this.tieBreakeranswer;
    }
}
// Export this module
module.exports = User