import { CustomHttp } from '../services/custom-http';
import config from "../../config/config";
import { Auth } from '../services/auth';
import { UrlManager } from '../utils/url-manager';
import { QuizTestType, QuizType } from '../types/quiz.type';
import { UserInfoType } from '../types/user-info.type';
import { DefaultResponseType } from '../types/default-response.type';

export class Answers {
    private quiz: QuizType | null;
    readonly testId: string | null;
    readonly answersLinkElement: HTMLElement | null;

    constructor() {
        this.quiz = null;
        this.testId = UrlManager.getQueryParams('id');
        this.answersLinkElement = document.getElementById('answersLink');

        if (this.answersLinkElement) {
            this.answersLinkElement.onclick = this.checkResult.bind(this);
        }

        this.init();
    }

    private async init(): Promise<void> {
        if (this.testId) {
            const userInfo: UserInfoType | null = Auth.getUserInfo();
            if (!userInfo) {
                location.href = '#/';
                return;
            }
            try {
                const result: DefaultResponseType | QuizTestType = await CustomHttp.request(config.host + '/tests/' + this.testId + '/result/details?userId=' + userInfo.userId);
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }
                    
                    this.quiz = (result as QuizTestType).test;

                    const whoCompletedElement = document.getElementById('whoCompleted');
                    if (whoCompletedElement) {
                        whoCompletedElement.innerText = userInfo.fullName + ', ' + userInfo.email;
                    }

                    const testLevelElement = document.getElementById('testLevel');
                    if (testLevelElement && this.quiz) {
                        testLevelElement.innerText = this.quiz.name;
                    }

                    this.showRightAnswer();
                    return;
                }
            } catch (error) {
                console.log(error);
            }
        }
        location.href = '#/';
    }

    private showRightAnswer(): void {
        if(!this.quiz) return;

        const answersItems: HTMLElement | null = document.getElementById('answersItems');
        this.quiz.questions.forEach((questionItem, index) => {
            const questionElement: HTMLElement | null = document.createElement('div');
            questionElement.className = 'answers-item';

            const questionTitleElement: HTMLElement | null = document.createElement('div');
            questionTitleElement.className = 'answers-item__title';
            questionTitleElement.innerHTML = `<span class="text_purple">Вопрос ${index + 1}: </span> ${questionItem.question}`;

            const questionItemElement: HTMLElement | null = document.createElement('div');
            questionItem.answers.forEach(answerItem => {
                const answerItemElement: HTMLElement | null = document.createElement('div');
                answerItemElement.className = 'options-item'
                const inputId = 'answer-' + answerItem.id;
                const answerRadioButton: HTMLElement | null = document.createElement('input');
                answerRadioButton.className = 'test__answer-options-marker';
                answerRadioButton.setAttribute('type', 'radio');
                answerRadioButton.setAttribute('id', inputId);
                answerRadioButton.setAttribute('disabled', 'disabled');
                answerRadioButton.setAttribute('value', answerItem.id.toString());

                if (answerItem.correct !== undefined) {
                    answerRadioButton.setAttribute('checked', 'checked');
                    let checkedColor = answerItem.correct ? "correct-answer" : "mistake-answer";
                    answerRadioButton.classList.add(checkedColor);
                }

                const answerLabel: HTMLElement | null = document.createElement('label');
                answerLabel.className = 'test__answer-options-text';
                answerLabel.setAttribute('for', inputId);
                answerLabel.innerText = answerItem.answer;

                answerItemElement.appendChild(answerRadioButton);
                answerItemElement.appendChild(answerLabel);
                questionItemElement.appendChild(answerItemElement);
            });


            questionElement.appendChild(questionTitleElement);
            questionElement.appendChild(questionItemElement);

            if(answersItems){
                answersItems.appendChild(questionElement);
            }
        });
    }

    checkResult() {
        location.href = '#/result?id=' + this.testId;
    }
}