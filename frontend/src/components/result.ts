import { CustomHttp } from '../services/custom-http';
import config from "../../config/config";
import { Auth } from '../services/auth';
import { UrlManager } from '../utils/url-manager';
import { UserInfoType } from '../types/user-info.type';
import { DefaultResponseType } from '../types/default-response.type';
import { TestResultType } from '../types/test-result.type';

export class Result {
    readonly testId: string | null;

    constructor() {
        this.testId = UrlManager.getQueryParams('id');
        (document.getElementById('answersLink') as HTMLElement).onclick = this.checkAnswers.bind(this);
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
                const result: DefaultResponseType | TestResultType = await CustomHttp.request(config.host + '/tests/' + this.testId + '/result?userId=' + userInfo.userId);
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }

                    const resultElement: HTMLElement | null = document.getElementById('result');

                    if (resultElement) {
                        resultElement.innerHTML = (result as TestResultType).score + '/' + (result as TestResultType).total;
                    }
                    return;
                }
            } catch (error) {
                console.log(error);
            }
        }
        location.href = '#/';
    }

    private checkAnswers(): void {
        location.href = '#/answers?id=' + this.testId;
    }
}