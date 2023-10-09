const socket = io('http://localhost:8000', {
    transports: ['websocket']
});

socket.on('connect', () => {
    console.log('Connected to the server');
});
socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});

socket.on('userId', (userId) => {
    console.log('got my unique id', userId);
    localStorage.setItem("userId", userId);
});

const startQuizBtn = document.getElementById('startQuizBtn');
startQuizBtn.addEventListener('click', () => {
    const userId = localStorage.getItem('userId');
    socket.emit('startquiz', userId);
});

socket.on('userJoined', (userId) => {
    console.log('A new user joined the room having Id:- ', userId);
});

socket.on('roomJoined', (room) => {
    console.log('Joined room having ID:- ', room);
});

const waitingTextBtn = document.getElementById('waitingText');
socket.on('waitingForPlayer', () => {
    console.log('Waiting for another player to join');
    startQuizBtn.style.display = 'none';
    waitingTextBtn.style.display = 'block';
});

const questionSection = document.getElementById('questionSection');
var questionsList = [];
var questionIndex;
socket.on('questions', (questions) => {
    console.log(questions)
    startQuizBtn.style.display = 'none';
    waitingTextBtn.style.display = 'none';
    questionSection.style.display = 'block';
    questionsList = [...questions];
    questionIndex = 0;
    displayQuestion(questionsList[questionIndex], '#questionSection h2', 'optionContainer');
});

function displayQuestion(questionObj, Hid, Cid) {
    const questionHeading = document.querySelector(Hid);
    questionHeading.textContent = questionObj.question;

    const options = [...questionObj.incorrect_answers, questionObj.correct_answer];

    const optionContainer = document.getElementById(Cid);
    optionContainer.innerHTML = '';

    options.forEach((option) => {
        const label = document.createElement('label');

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'option';
        input.value = option;

        const labelText = document.createTextNode(option);

        label.appendChild(input);
        label.appendChild(labelText);

        optionContainer.appendChild(label);
    });
}

var answerList = [];
const questionForm = document.getElementById('questionForm');
questionForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const selectedOption = document.querySelector('input[name="option"]:checked');

    if (selectedOption) {
        const answer = selectedOption.value;
        answerList.push(answer);
        questionIndex++;
        if (questionIndex < questionsList.length) {
            questionForm.reset()
            displayQuestion(questionsList[questionIndex], '#questionSection h2', 'optionContainer');
        } else {
            questionForm.reset()
            const userId = localStorage.getItem('userId');
            socket.emit('answers', answerList, userId);
        }
    }
});

const skipButton = document.getElementById('skipButton');
skipButton.addEventListener('click', (event) => {
    event.preventDefault();
    answerList.push('pass');
    questionIndex++;
    if (questionIndex < questionsList.length) {
        questionForm.reset()
        displayQuestion(questionsList[questionIndex], '#questionSection h2', 'optionContainer');
    } else {
        questionForm.reset();
        const userId = localStorage.getItem('userId');
        socket.emit('answers', answerList, userId);
    }
});

const opponentText = document.getElementById('opponentText');
socket.on('waitingForOpponent', () => {
    console.log('Waiting for opponent to complete');
    startQuizBtn.style.display = 'none';
    questionSection.style.display = 'none';
    opponentText.style.display = 'block';
    TiequestionSection.style.display = 'none';
});

const calculatingText = document.getElementById('calculatingText');
socket.on('calculating', () => {
    console.log('Calculating');
    startQuizBtn.style.display = 'none';
    questionSection.style.display = 'none';
    opponentText.style.display = 'none';
    calculatingText.style.display = 'block';
});

const scoreSection = document.getElementById('scoreSection');
socket.on('result', (resObj) => {
    console.log('showing res', resObj);
    opponentText.style.display = 'none';
    calculatingText.style.display = 'none';
	TiequestionSection.style.display = 'none';
	questionSection.style.display = 'none';
    scoreSection.style.display = 'block';
	playAgain.style.display = 'block';

    const scoreHeading = document.querySelector('#scoreSection h2');
    scoreHeading.textContent = resObj.result;

    if (resObj.scoreCard && resObj.scoreCard.length > 0) {
        const scoreContainer = document.getElementById('scoreContainer');
        scoreContainer.innerHTML = '';

        resObj.scoreCard.forEach((item, index) => {
            const para = document.createElement('p');
            var text = document.createTextNode(`Question${index+1} : ${item}`);

            para.appendChild(text);

            scoreContainer.appendChild(para);
        });
    }

});

const tieBreakerText = document.getElementById('tieBreakerText');
socket.on('tieBreaker', () => {
    console.log('tieBreaker');
    calculatingText.style.display = 'none';
    tieBreakerText.style.display = 'block';
});

const TiequestionSection = document.getElementById('TiequestionSection');
socket.on('tieBreakerQuestion', (question) => {
    console.log(question)
    opponentText.style.display = 'none';
    calculatingText.style.display = 'none';
    tieBreakerText.style.display = 'none';
    TiequestionSection.style.display = 'block';

    displayQuestion(question, '#TiequestionSection h2', 'TieoptionContainer');
});

const TiequestionForm = document.getElementById('TiequestionForm');
TiequestionForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const selectedOption = document.querySelector('#TieoptionContainer input[name="option"]:checked')
        if (selectedOption) {
            const answer = selectedOption.value;
            questionForm.reset()
            const userId = localStorage.getItem('userId');
            socket.emit('tieBreakerAswers', answer, userId);
        }
});


const playAgain = document.getElementById('playAgain');
playAgain.addEventListener('click', () => {
	TiequestionSection.style.display = 'none';
    scoreSection.style.display = 'none';
	playAgain.style.display = 'none';
    const userId = localStorage.getItem('userId');
    socket.emit('startquiz', userId);
});