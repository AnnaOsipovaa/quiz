export class UrlManager {
    public static getQueryParams(param: string): string | null {
        
        const w = (new RegExp('[?&]' + encodeURIComponent(param) + '=([^&]*)')).exec(location.href)?.toString();
        const r = decodeURIComponent(param[1]);
        console.log(w);
        console.log(r);
        debugger
        if (param === (new RegExp('[?&]' + encodeURIComponent(param) + '=([^&]*)')).exec(location.href)?.toString()){
            return decodeURIComponent(param[1]);
        }
        return null;
    }
}