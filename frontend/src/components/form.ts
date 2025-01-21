import { Auth } from '../services/auth';
import { CustomHttp } from '../services/custom-http';
import config from "../../config/config";
import { FormFielType } from '../types/form-fiel.type';
import { SignupResponseType } from '../types/signup-response.type';
import { LoginResponseType } from '../types/login-response.type';

export class Form {
    readonly agreeElement: HTMLInputElement | null;
    readonly processElement: HTMLElement | null;
    readonly page: 'signup' | 'login';
    readonly fields: FormFielType[] = [];

    constructor(page: 'signup' | 'login') {
        this.agreeElement = null;
        this.processElement = null;
        this.page = page;

        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/choice';
            return;
        }

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^[a-z0-9\.]+@[a-z]+\.[a-z]+$/i,
                valid: false
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/i,
                valid: false
            }
        ];

        if (this.page === 'signup') {
            this.fields.unshift(
                {
                    name: 'name',
                    id: 'name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false
                },
                {
                    name: 'lastName',
                    id: 'last-name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false
                }
            );
        }

        const that: Form = this;

        this.fields.forEach((item: FormFielType) => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            if (item.element) {
                item.element.onchange = function () {
                    that.validateField.call(that, item, this as HTMLInputElement);
                }
            }
        })

        this.processElement = document.getElementById('process');
        if (this.processElement) {
            this.processElement.onclick = function () {
                that.processForm();
            }
        }

        if (this.page === 'signup') {
            this.agreeElement = document.getElementById('site-rules') as HTMLInputElement;
            if (this.agreeElement) {
                this.agreeElement.onchange = function () {
                    that.validateForm();
                }
            }
        }
    }

    private validateField(field: FormFielType, element: HTMLInputElement): void {
        if (element.parentNode) {
            if (!element.value || !element.value.match(field.regex)) {
                (element.parentNode as HTMLElement).style.borderColor = 'red';
                field.valid = false;
            } else {
                (element.parentNode as HTMLElement).style.borderColor = '';
                field.valid = true;
            }
        }
        this.validateForm();
    }

    private validateForm(): boolean {
        const validForm: boolean = this.fields.every((item: FormFielType) => item.valid);
        const isValid: boolean = this.agreeElement ? this.agreeElement.checked && validForm : validForm;
        if (this.processElement) {
            if (isValid) {
                this.processElement.removeAttribute('disabled');
            } else {
                this.processElement.setAttribute('disabled', 'disabled');
            }
        }
        return isValid
    }

    private async processForm(): Promise<void> {
        if (this.validateForm()) {
            const email: string | undefined = this.fields.find((item: FormFielType) => item.name === 'email')?.element?.value;
            const password: string | undefined = this.fields.find(item => item.name === 'password')?.element?.value;

            if(email && password){
                if (this.page === 'signup') {
                    try {
                        const result: SignupResponseType = await CustomHttp.request(config.host + '/signup', 'POST', {
                            name: this.fields.find(item => item.name === 'name')?.element?.value,
                            lastName: this.fields.find(item => item.name === 'lastName')?.element?.value,
                            email: email,
                            password: password
                        });
    
                        if (result) {
                            if (result.error || !result.user) {
                                throw new Error(result.message);
                            }
                        }
                    } catch (error) {
                        console.log(error);
                        alert('Произошла ошибка поавторите попытку позже.');
                        location.href = '#/';
                        return;
                    }
                }
    
                try {
                    const result: LoginResponseType = await CustomHttp.request(config.host + '/login', 'POST', {
                        email: email,
                        password: password
                    });
    
                    if (result) {
                        if (result.error || !result.accessToken || !result.refreshToken || !result.fullName || !result.userId) {
                            throw new Error(result.message);
                        }
                        
                        Auth.setTokens(result.accessToken, result.refreshToken);
                        Auth.setUserInfo({
                            fullName: result.fullName,
                            userId: result.userId,
                            email: email
                        });
                        location.href = '#/choice';
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
}