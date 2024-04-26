import request from 'sync-request';

class CCBUS {
    host = 'https://ccx.ccgjbus.com:20000/waitbus/public/line/';
    apis = {
        list: 'list',
        line: 'static/info?',
        realTime: 'runtime/info?',
    };
    getLineList() {
        return this.requestData(this.host + this.apis.list)[0]['lines'];
    }
    getLineInfo(lineNo) {
        return this.requestData(this.host + this.apis.line, { lineNo });
    }
    getLineRealTime(lineNo, isUpDown, labelNo) {
        return this.requestData(this.host + this.apis.realTime, {
            lineNo,
            isUpDown,
            labelNo,
            encrypt: 0,
        });
    }
    requestData(url, params = {}) {
        for (let key in params) {
            url += key + '=' + params[key] + '&';
        }
        let res = request('GET', url);
        let data = JSON.parse(res.getBody('UTF-8'));
        if (!data) {
            throw res;
        }
        return data;
    }
}

export default CCBUS;
