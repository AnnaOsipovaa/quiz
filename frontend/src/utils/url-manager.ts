export class UrlManager {
    public static getQueryParams(param: string): string | null {
        if (param === (new RegExp('[?&]' + encodeURIComponent(param) + '=([^&]*)')).exec(location.href)?.toString()){
            return decodeURIComponent(param[1]);
        }
        return null;
    }
}