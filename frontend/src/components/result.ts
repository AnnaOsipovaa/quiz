import { CustomHttp } from '../services/custom-http.js';
import config from "../../config/config.js";
import { Auth } from '../services/auth.js';
import { UrlManager } from '../utils/url-manager.js';

export class Result {
    constructor() {
        this.testId = UrlManager.getQueryParams('id');
        document.getElementById('answersLink').onclick = this.checkAnswers.bind(this);
        this.init();
    }

    async init() {
        if (this.testId) {
            const userInfo = Auth.getUserInfo();
            if (!userInfo) {
                location.href = '#/';
            }
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.testId + '/result?userId=' + userInfo.userId);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    document.getElementById('result').innerHTML = result.score + '/' + result.total;
                    return;
                }
            } catch (error) {
                console.log(error);
            }
        }
        location.href = '#/';
    }

    checkAnswers() {
        location.href = '#/answers?id=' + this.testId;
    }
}