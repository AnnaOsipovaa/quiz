import { CustomHttp } from '../services/custom-http.js';
import config from "../../config/config.js";
import { UrlManager } from '../utils/url-manager.js';
import { Auth } from '../services/auth.js';

export class Test {
    constructor() {
        this.quiz = null;
        this.currentQuestionIndex = 1;
        this.testTitle = null;
        this.testQuestionTitle = null;
        this.answerOptions = null;
        this.nextButtonElement = null;
        this.prevButtonElement = null;
        this.passLinkElement = null;
        this.userResult = [];
        this.progressBarElement = null;
        this.testId = UrlManager.getQueryParams('id');
        this.init();
    }

    async init() {
        if (this.testId) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.testId);
                if (result) {
                    if (result.error) {
                        throw new Error();
                    }
                    this.quiz = result;
                    this.startQuiz();
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    startQuiz() {
        this.testQuestionTitle = document.getElementById('question-title');

        this.testTitle = document.getElementById('test-title');
        this.testTitle.innerText = this.quiz.name;

        this.answerOptions = document.getElementById('answer-options');
        this.nextButtonElement = document.getElementById('nextButton');
        this.nextButtonElement.onclick = this.move.bind(this, 'next');

        this.passLinkElement = document.getElementById('passLink');
        this.passLinkElement.onclick = this.move.bind(this, 'pass');

        this.prevButtonElement = document.getElementById('prevButton');
        this.prevButtonElement.onclick = this.move.bind(this, 'prev');

        this.progressBarElement = document.getElementById('progress-bar');
        this.prepareProgressBar();
        this.showQuestion();

        let seconds = 59;
        const timerElement = document.getElementById('timer');
        timerElement.innerText = seconds;
        this.interval = setInterval(function () {
            seconds--;
            timerElement.innerText = seconds;
            if (seconds === 0) {
                clearInterval(this.interval);
                this.complete();
            }
        }.bind(this), 1000);
    }

    showQuestion() {
        const that = this;

        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        this.testQuestionTitle.innerHTML = `<span class="text_purple">Вопрос ${this.currentQuestionIndex}: </span> ${activeQuestion.question}`;

        this.answerOptions.innerHTML = '';

        const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);
        activeQuestion.answers.forEach(answerItem => {
            const answerOptionsItem = document.createElement('div');
            answerOptionsItem.className = 'options-item';

            const inputId = 'answer-' + answerItem.id;
            const answerRadioButton = document.createElement('input');
            answerRadioButton.className = 'test__answer-options-marker';
            answerRadioButton.setAttribute('type', 'radio');
            answerRadioButton.setAttribute('id', inputId);
            answerRadioButton.setAttribute('name', 'answer');
            answerRadioButton.setAttribute('value', answerItem.id);

            if (chosenOption && chosenOption.chosenAnswerId === answerItem.id) {
                answerRadioButton.setAttribute('checked', 'checked');
            }

            answerRadioButton.onchange = function () {
                that.choseAnswer();
                that.disablerPassLink();
            }

            const answerLabel = document.createElement('label');
            answerLabel.className = 'test__answer-options-text';
            answerLabel.setAttribute('for', inputId);
            answerLabel.innerText = answerItem.answer;

            answerOptionsItem.appendChild(answerRadioButton);
            answerOptionsItem.appendChild(answerLabel);
            this.answerOptions.appendChild(answerOptionsItem);
        });

        if (chosenOption && chosenOption.chosenAnswerId) {
            this.nextButtonElement.removeAttribute('disabled');
            this.passLinkElement.classList.add('disabled-link');
        } else {
            this.nextButtonElement.setAttribute('disabled', 'disabled');
            this.passLinkElement.classList.remove('disabled-link');
        }

        if (this.currentQuestionIndex === this.quiz.questions.length) {
            this.nextButtonElement.innerText = "Завершить";
        } else {
            this.nextButtonElement.innerText = "Далее";
        }

        if (this.currentQuestionIndex > 1) {
            this.prevButtonElement.removeAttribute('disabled');
        } else {
            this.prevButtonElement.setAttribute('disabled', 'disabled');
        }

    }

    disablerPassLink() {
        this.passLinkElement.classList.add('disabled-link');
    }

    choseAnswer() {
        this.nextButtonElement.removeAttribute('disabled');
    }

    prepareProgressBar() {
        this.quiz.questions.forEach((item, index) => {
            const progressBarItem = document.createElement('div');
            progressBarItem.className = 'test__progress-bar-item ' + (index === 0 ? 'active' : '');

            const progressBarItemCircle = document.createElement('div');
            progressBarItemCircle.className = 'test__progress-bar-item-circle';

            const progressBarItemText = document.createElement('div');
            progressBarItemText.className = 'test__progress-bar-item-text';
            progressBarItemText.innerText = `Вопрос ${index + 1}`;

            progressBarItem.appendChild(progressBarItemCircle);
            progressBarItem.appendChild(progressBarItemText);
            this.progressBarElement.appendChild(progressBarItem);
        });
    }

    move(action) {
        const chosenAnswer = Array.from(document.getElementsByClassName('test__answer-options-marker')).find(element => element.checked)
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];

        let chosenAnswerId = null;
        if (chosenAnswer && chosenAnswer.value) {
            chosenAnswerId = Number(chosenAnswer.value);
        }

        const existingResult = this.userResult.find(item => item.questionId === activeQuestion.id);
        if (existingResult) {
            existingResult.chosenAnswerId = chosenAnswerId;
        } else {
            this.userResult.push({
                questionId: activeQuestion.id,
                chosenAnswerId: chosenAnswerId
            });
        }

        if (action === 'next' || action === 'pass') {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex--;
        }

        if (this.currentQuestionIndex > this.quiz.questions.length) {
            clearInterval(this.interval);
            this.complete();
            return;
        }

        Array.from(this.progressBarElement.children).forEach((item, index) => {
            const currentItemIndex = index + 1;
            item.classList.remove('active');
            item.classList.remove('complite');

            if (currentItemIndex === this.currentQuestionIndex) {
                item.classList.add('active');
            } else {
                if (currentItemIndex < this.currentQuestionIndex) {
                    item.classList.add('complite');
                }
            }
        });

        this.showQuestion();
    }

    async complete() {
        const userInfo = Auth.getUserInfo();
        if(!userInfo){
            location.href = '#/';
        }

        try {
            const result = await CustomHttp.request(config.host + '/tests/' + this.testId + '/pass', 'POST', {
                userId: userInfo.userId,
                results: this.userResult
            });
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                location.href = '#/result?id=' + this.testId;
            }
        } catch (error) {
            console.log(error);
        }
    }
}