import { CustomHttp } from '../services/custom-http.js';
import { Auth } from '../services/auth.js';
import config from "../../config/config.js";

export class Choice {

    constructor() {
        this.testResult = null;
        this.quizzes = [];
        this.init();
    }

    async init() {
        try {
            const result = await CustomHttp.request(config.host + '/tests');
            if (result) {
                if (result.error) {
                    throw new Error();
                }
                this.quizzes = result;
            }
        } catch (error) {
            return console.log(error);
        }

        const userInfo = Auth.getUserInfo();
        if (userInfo) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/results?userId=' + userInfo.userId);
                if (result) {
                    if (result.error) {
                        throw new Error();
                    }
                    this.testResult = result;
                }
            } catch (error) {
                return console.log(error);
            }
        }

        this.proccessQuizzes();
    }

    proccessQuizzes() {
        const that = this;
        const choiceOptionElement = document.getElementById('choice__actions');
        if (this.quizzes && this.quizzes.length > 0) {
            this.quizzes.forEach(quiz => {
                const actionItemElement = document.createElement('div');
                actionItemElement.className = 'actions-item';
                actionItemElement.setAttribute('data-id', quiz.id);
                actionItemElement.onclick = function () {
                    that.chooseQuize(this);
                };

                const actionItemTextElement = document.createElement('div');
                actionItemTextElement.className = 'actions-item__text';
                actionItemTextElement.innerText = quiz.name;

                const actionItemArrowElement = document.createElement('div');
                actionItemArrowElement.className = 'actions-item__arrow';

                const result = this.testResult.find(item => item.testId === quiz.id);
                if (result) {
                    console.log(result);
                    const resultElement = document.createElement('div');
                    resultElement.className = 'actions-item__result';
                    resultElement.innerHTML = '<div>Результат</div><div>' + result.score + '/' + result.total + '</div>';
                    actionItemElement.appendChild(resultElement);
                }


                const actionItemArrowImgElement = document.createElement('img');
                actionItemArrowImgElement.className = 'actions-item__arrow-img';
                actionItemArrowImgElement.setAttribute('src', '././img/icon.png');
                actionItemArrowImgElement.setAttribute('alt', 'стрелка');

                actionItemArrowElement.appendChild(actionItemArrowImgElement);
                actionItemElement.appendChild(actionItemTextElement);
                actionItemElement.appendChild(actionItemArrowElement);
                

                choiceOptionElement.appendChild(actionItemElement);
            });
        }
    }

    chooseQuize(element) {
        const testId = element.getAttribute('data-id');
        if (testId) {
            location.href = "#/test?id=" + testId;
        }
    }
}