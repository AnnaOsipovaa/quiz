import { CustomHttp } from '../services/custom-http';
import config from "../../config/config";
import { UrlManager } from '../utils/url-manager';
import { Auth } from '../services/auth';
import { QuizAnswersType, QuizQuestionType, QuizType } from '../types/quiz.type';
import { UserResultType } from '../types/user-result.type';
import { DefaultResponseType } from '../types/default-response.type';
import { ActionTestType } from '../types/action-test.type';
import { UserInfoType } from '../types/user-info.type';
import { PassTestResponseType } from '../types/pass-test-pesponse.type';

export class Test {
    private quiz: QuizType | null;
    private answerOptions: HTMLElement | null;
    readonly userResult: UserResultType[];
    private testTitleElement: HTMLElement | null;
    private testQuestionTitle: HTMLElement | null;
    private currentQuestionIndex: number;
    private nextButtonElement: HTMLElement | null;
    private prevButtonElement: HTMLElement | null;
    private passLinkElement: HTMLElement | null;
    private progressBarElement: HTMLElement | null;
    private testId: string | null;
    private interval: number = 0;

    constructor() {
        this.quiz = null;
        this.currentQuestionIndex = 1;
        this.testTitleElement = null;
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

    private async init(): Promise<void> {
        if (this.testId) {
            try {
                const result: DefaultResponseType | QuizType = await CustomHttp.request(config.host + '/tests/' + this.testId);
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }
                    this.quiz = result as QuizType;
                    this.startQuiz();
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    private startQuiz(): void {
        if (!this.quiz) return;

        this.testQuestionTitle = document.getElementById('question-title');

        this.testTitleElement = document.getElementById('test-title');
        if (this.testTitleElement) {
            this.testTitleElement.innerText = this.quiz.name;
        }

        this.answerOptions = document.getElementById('answer-options');
        this.nextButtonElement = document.getElementById('nextButton');
        if (this.nextButtonElement) {
            this.nextButtonElement.onclick = this.move.bind(this, ActionTestType.next);
        }

        this.passLinkElement = document.getElementById('passLink');
        if (this.passLinkElement) {
            this.passLinkElement.onclick = this.move.bind(this, ActionTestType.pass);
        }

        this.prevButtonElement = document.getElementById('prevButton');
        if (this.prevButtonElement) {
            this.prevButtonElement.onclick = this.move.bind(this, ActionTestType.prev);
        }

        this.progressBarElement = document.getElementById('progress-bar');
        this.prepareProgressBar();
        this.showQuestion();

        let seconds: number = 59;

        const timerElement: HTMLElement | null = document.getElementById('timer');
        if (timerElement) {
            timerElement.innerText = seconds.toString();
        }

        const that: Test = this;

        this.interval = window.setInterval(function () {
            seconds--;

            if (timerElement) {
                timerElement.innerText = seconds.toString();
            }

            if (seconds === 0) {
                clearInterval(that.interval);
                that.complete();
            }
        }.bind(this), 1000);
    }

    private showQuestion(): void {
        if (!this.quiz) return;

        const that: Test = this;

        const activeQuestion: QuizQuestionType = this.quiz.questions[this.currentQuestionIndex - 1];
        if (this.testQuestionTitle) {
            this.testQuestionTitle.innerHTML = `<span class="text_purple">Вопрос ${this.currentQuestionIndex}: </span> ${activeQuestion.question}`;
        }

        if (this.answerOptions) {
            this.answerOptions.innerHTML = '';
        }

        let chosenOption: UserResultType | undefined;
        if (this.userResult) {
            chosenOption = this.userResult.find((item: UserResultType) => item.questionId === activeQuestion.id);
        }

        activeQuestion.answers.forEach((answerItem: QuizAnswersType) => {
            const answerOptionsItem: HTMLElement | null = document.createElement('div');
            answerOptionsItem.className = 'options-item';

            const inputId = 'answer-' + answerItem.id;
            const answerRadioButton: HTMLElement | null = document.createElement('input');
            answerRadioButton.className = 'test__answer-options-marker';
            answerRadioButton.setAttribute('type', 'radio');
            answerRadioButton.setAttribute('id', inputId);
            answerRadioButton.setAttribute('name', 'answer');
            answerRadioButton.setAttribute('value', answerItem.id.toString());

            if (chosenOption && chosenOption.chosenAnswerId === answerItem.id) {
                answerRadioButton.setAttribute('checked', 'checked');
            }

            answerRadioButton.onchange = function () {
                that.choseAnswer();
                that.disablerPassLink();
            }

            const answerLabel: HTMLElement | null = document.createElement('label');
            answerLabel.className = 'test__answer-options-text';
            answerLabel.setAttribute('for', inputId);
            answerLabel.innerText = answerItem.answer;

            answerOptionsItem.appendChild(answerRadioButton);
            answerOptionsItem.appendChild(answerLabel);

            if (this.answerOptions) {
                this.answerOptions.appendChild(answerOptionsItem);
            }
        });

        if (this.nextButtonElement) {
            if(this.passLinkElement){
                if (chosenOption && chosenOption.chosenAnswerId) {
                    this.nextButtonElement.removeAttribute('disabled');
                    this.passLinkElement.classList.add('disabled-link');
                } else {
                    this.nextButtonElement.setAttribute('disabled', 'disabled');
                    this.passLinkElement.classList.remove('disabled-link');
                }
            }

            if (this.currentQuestionIndex === this.quiz.questions.length) {
                this.nextButtonElement.innerText = "Завершить";
            } else {
                this.nextButtonElement.innerText = "Далее";
            }
        }

        if (this.prevButtonElement) {
            if (this.currentQuestionIndex > 1) {
                this.prevButtonElement.removeAttribute('disabled');
            } else {
                this.prevButtonElement.setAttribute('disabled', 'disabled');
            }
        }
    }

    private disablerPassLink(): void {
        if (this.passLinkElement) {
            this.passLinkElement.classList.add('disabled-link');
        }
    }

    private choseAnswer(): void {
        if (this.nextButtonElement) {
            this.nextButtonElement.removeAttribute('disabled');
        }
    }

    private prepareProgressBar(): void {
        if (!this.quiz) return;

        this.quiz.questions.forEach((item, index) => {
            const progressBarItem: HTMLElement | null = document.createElement('div');
            progressBarItem.className = 'test__progress-bar-item ' + (index === 0 ? 'active' : '');

            const progressBarItemCircle: HTMLElement | null = document.createElement('div');
            progressBarItemCircle.className = 'test__progress-bar-item-circle';

            const progressBarItemText: HTMLElement | null = document.createElement('div');
            progressBarItemText.className = 'test__progress-bar-item-text';
            progressBarItemText.innerText = `Вопрос ${index + 1}`;

            progressBarItem.appendChild(progressBarItemCircle);
            progressBarItem.appendChild(progressBarItemText);

            if (this.progressBarElement) {
                this.progressBarElement.appendChild(progressBarItem);
            }
        });
    }

    private move(action: ActionTestType): void {
        if (!this.quiz) return;

        const chosenAnswer: HTMLInputElement | undefined = Array.from(document.getElementsByClassName('test__answer-options-marker')).find(element => (element as HTMLInputElement).checked) as HTMLInputElement;
        const activeQuestion: QuizQuestionType = this.quiz.questions[this.currentQuestionIndex - 1];

        let chosenAnswerId: number | null = null;
        if (chosenAnswer && chosenAnswer.value) {
            chosenAnswerId = Number(chosenAnswer.value);
        }

        const existingResult: UserResultType | undefined = this.userResult.find((item: UserResultType) => item.questionId === activeQuestion.id);
        if (chosenAnswerId) {
            if (existingResult) {
                existingResult.chosenAnswerId = chosenAnswerId;
            } else {
                this.userResult.push({
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId
                });
            }
        }

        if (action === ActionTestType.next || action === ActionTestType.pass) {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex--;
        }

        if (this.currentQuestionIndex > this.quiz.questions.length) {
            clearInterval(this.interval);
            this.complete();
            return;
        }

        if (this.progressBarElement) {
            Array.from(this.progressBarElement.children).forEach((item: Element, index: number) => {
                const currentItemIndex: number = index + 1;
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
        }

        this.showQuestion();
    }

    private async complete(): Promise<void> {
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
            return;
        }

        try {
            const result: DefaultResponseType | PassTestResponseType = await CustomHttp.request(config.host + '/tests/' + this.testId + '/pass', 'POST', {
                userId: userInfo.userId,
                results: this.userResult
            });
            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message);
                }
                location.href = '#/result?id=' + this.testId;
            }
        } catch (error) {
            console.log(error);
        }
    }
}