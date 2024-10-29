export class UrlManager {
    static getQueryParams(param) {
        if (param = (new RegExp('[?&]' + encodeURIComponent(param) + '=([^&]*)')).exec(location.href)){
            return decodeURIComponent(param[1]);
        }
    }
}