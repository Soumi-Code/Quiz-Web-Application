const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const timerText = document.getElementById("timer");
const loader = document.getElementById("loader");
const game = document.getElementById("game");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let timer;

fetch("https://api.allorigins.win/get?url=" + encodeURIComponent("https://api.jsonserve.com/Uw5CrX"))
  .then(res => res.json())
  .then(data => {
    const loadedData = JSON.parse(data.contents);
    console.log("Loaded Data:", loadedData);

    // Access the questions array from the loaded data
    questions = loadedData.questions || [];
    console.log("Questions Array:", questions);
    if (questions.length > 0) {
      startGame();
    } else {
      console.error("No questions available to start the game!");
      alert("No questions available. Please try again later.");
    }
  })
  .catch(err => {
    console.error("Error fetching the questions: ", err);
    alert("Failed to load questions. Please try again later.");
  });

const CORRECT_BONUS = 4;
const WRONG_PENALTY = 1;  
const MAX_QUESTIONS = 10;

const startGame = () => {
  questionCounter = 0;
  score = 0;
  availableQuestions = [...questions];
  getNewQuestion();
  game.classList.remove("hidden");
  loader.classList.add("hidden");
};

const getNewQuestion = () => {
  if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem("mostRecentScore", score);
    return window.location.assign("/end.html");
  }

  questionCounter++;
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];

  question.innerText = currentQuestion.description;
  choices.forEach(choice => {
    const number = choice.dataset["number"];
    choice.innerText = currentQuestion.options[number - 1].description;
  });

  availableQuestions.splice(questionIndex, 1);
  acceptingAnswers = true;

  startTimer(15);
};

const startTimer = (time) => {
  let remainingTime = time;
  timerText.innerText = remainingTime;

  timer = setInterval(() => {
    remainingTime--;
    timerText.innerText = remainingTime;

    if (remainingTime <= 0) {
      clearInterval(timer);
      getNewQuestion();
    }
  }, 1000);
};

choices.forEach(choice => {
  choice.addEventListener("click", e => {
    if (!acceptingAnswers) return;
    acceptingAnswers = false;
    clearInterval(timer);

    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset["number"];
    const isCorrect = currentQuestion.options[selectedAnswer - 1].is_correct;
    const classToApply = isCorrect ? "correct" : "incorrect";

    if (isCorrect) {
      incrementScore(CORRECT_BONUS);
    } else {
      decrementScore(WRONG_PENALTY);
    }

    selectedChoice.parentElement.classList.add(classToApply);
    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    }, 1000);
  });
});

const incrementScore = num => {
  score += num;
  scoreText.innerText = score;
};

const decrementScore = num => {
  score = Math.max(0, score - num); 
  scoreText.innerText = score;
};
