import { CustomHttp } from '../services/custom-http.js';
import config from "../../config/config.js";
import { Auth } from '../services/auth.js';
import { UrlManager } from '../utils/url-manager.js';

export class Answers {
    constructor() {
        this.quiz = null;
        this.testId = UrlManager.getQueryParams('id');
        document.getElementById('answersLink').onclick = this.checkResult.bind(this);
        this.init();
    }

    async init() {
        if (this.testId) {
            const userInfo = Auth.getUserInfo();
            if (!userInfo) {
                location.href = '#/';
            }
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.testId + '/result/details?userId=' + userInfo.userId);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.quiz = result.test;
                    document.getElementById('whoCompleted').innerText = userInfo.fullName + ', ' + userInfo.email;
                    document.getElementById('testLevel').innerText = this.quiz.name;
                    this.showRightAnswer();
                    return;
                }
            } catch (error) {
                console.log(error);
            }
        }
        location.href = '#/';
    }

    showRightAnswer() {
        const answersItems = document.getElementById('answersItems');
        this.quiz.questions.forEach((questionItem, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'answers-item';

            const questionTitleElement = document.createElement('div');
            questionTitleElement.className = 'answers-item__title';
            questionTitleElement.innerHTML = `<span class="text_purple">Вопрос ${index + 1}: </span> ${questionItem.question}`;

            const questionItemElement = document.createElement('div');
            questionItem.answers.forEach(answerItem => {
                const answerItemElement = document.createElement('div');
                answerItemElement.className = 'options-item'
                const inputId = 'answer-' + answerItem.id;
                const answerRadioButton = document.createElement('input');
                answerRadioButton.className = 'test__answer-options-marker';
                answerRadioButton.setAttribute('type', 'radio');
                answerRadioButton.setAttribute('id', inputId);
                answerRadioButton.setAttribute('disabled', 'disabled');
                answerRadioButton.setAttribute('value', answerItem.id);

              
                if (answerItem.correct !== undefined) {
                    answerRadioButton.setAttribute('checked', 'checked');
                    let checkedColor = answerItem.correct ? "correct-answer" : "mistake-answer";
                    answerRadioButton.classList.add(checkedColor);
                }

                const answerLabel = document.createElement('label');
                answerLabel.className = 'test__answer-options-text';
                answerLabel.setAttribute('for', inputId);
                answerLabel.innerText = answerItem.answer;

                answerItemElement.appendChild(answerRadioButton);
                answerItemElement.appendChild(answerLabel);
                questionItemElement.appendChild(answerItemElement);
            });


            questionElement.appendChild(questionTitleElement);
            questionElement.appendChild(questionItemElement);
            answersItems.appendChild(questionElement);
        });
    }

    checkResult(){
        location.href = '#/result?id=' + this.testId;
    }
}