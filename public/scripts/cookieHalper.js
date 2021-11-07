var Cookie = {
    set: function (name, value, seconds) {
        value = encodeURIComponent(value);
        if (seconds) {
            var d = new Date();
            d.setTime(d.getTime() + (seconds * 1000));
            expiry = '; expires=' + d.toGMTString();
        }
        else {
            expiry = '';
        }
        document.cookie = name + '=' + value + expiry + '; path=/';
    },
    get: function (key) {
        key = key.replace(/[-[\]{}()*+?.\\^$|,]/g, "\\$&");
        var value = document.cookie.match('(?:^|;)\\s*' + key + '=([^;]*)');
        return value ? decodeURIComponent(value[1]) : false;
    },
    unset: function (cookie) {
        if (typeof cookie == 'object') this.set(cookie.key, '', -1);
        else this.set(cookie, '', -1);
    }
};