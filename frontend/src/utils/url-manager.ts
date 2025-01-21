export class UrlManager {
    public static getQueryParams(param: string): string | null {
        const paramSearch: RegExpExecArray | null = (new RegExp('[?&]' + encodeURIComponent(param) + '=([^&]*)')).exec(location.href);
        if(paramSearch){
            return decodeURIComponent(paramSearch[1]);
        }
        return null;
    }
}