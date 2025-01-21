import { CustomHttp } from '../services/custom-http';
import { Auth } from '../services/auth';
import config from "../../config/config";
import { QuizListType } from '../types/quiz-list.type';
import { TestResultType } from '../types/test-result.type';
import { UserInfoType } from '../types/user-info.type';
import { DefaultResponseType } from '../types/default-response.type';

export class Choice {
    private testResult: TestResultType[] | null = null;
    private quizzes: QuizListType[] = [];

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        try {
            this.quizzes = await CustomHttp.request(config.host + '/tests');
        } catch (error) {
            console.log(error);
            return;
        }

        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (userInfo) {
            try {
                const result: TestResultType[] | DefaultResponseType = await CustomHttp.request(config.host + '/tests/results?userId=' + userInfo.userId);
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }
                    this.testResult = result as TestResultType[];
                }
            } catch (error) {
                console.log(error);
                return;
            }
        }

        this.proccessQuizzes();
    }

    private proccessQuizzes(): void {
        const that: Choice = this;
        const choiceOptionElement: HTMLElement | null = document.getElementById('choice__actions');
        if (this.quizzes && this.quizzes.length > 0 && choiceOptionElement) {
            this.quizzes.forEach((quiz: QuizListType) => {
                const actionItemElement: HTMLElement | null = document.createElement('div');
                actionItemElement.className = 'actions-item';
                actionItemElement.setAttribute('data-id', quiz.id.toString());
                actionItemElement.onclick = function () {
                    that.chooseQuize(this as HTMLElement);
                };

                const actionItemTextElement: HTMLElement | null = document.createElement('div');
                actionItemTextElement.className = 'actions-item__text';
                actionItemTextElement.innerText = quiz.name;

                const actionItemArrowElement: HTMLElement | null = document.createElement('div');
                actionItemArrowElement.className = 'actions-item__arrow';

                if (this.testResult) {
                    const result: TestResultType | undefined = this.testResult.find((item: TestResultType) => item.testId === quiz.id);
                    if (result) {
                        const resultElement: HTMLElement | null = document.createElement('div');
                        resultElement.className = 'actions-item__result';
                        resultElement.innerHTML = '<div>Результат</div><div>' + result.score + '/' + result.total + '</div>';
                        actionItemElement.appendChild(resultElement);
                    }
                }

                const actionItemArrowImgElement: HTMLElement | null = document.createElement('img');
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

    private chooseQuize(element: HTMLElement): void{
        const testId: string | null = element.getAttribute('data-id');
        if (testId) {
            location.href = "#/test?id=" + testId;
        }
    }
}