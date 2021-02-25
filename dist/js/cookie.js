//** self define function for ajax process  */
var CommonMethods = {};
var domain = window.location.hostname;

CommonMethods.create = function (methods) {
    var Cms = methods.initialize;
    for (var mth in methods) {
        if (mth != "initialize") {
            Cms.prototype[mth] = methods[mth];
        }
    }
    return Cms;
};

var AjaxHandler = CommonMethods.create({
    initialize: function (url, data, type) {
        // 作為建構式
        this.url = url;
        this.data = data;
        this.type = type;
    },
    normalProcessed: function () {
        return $.ajax({
            url: this.url,
            type: this.type,
            data: this.data,
            dataType: "json",
            setRequestHeader: ("Content-Type", "application/x-www-form-urlencoded"),
            error: function (xhr, status, error) { }
        });
    },
    fileProcessed: function () {
        return $.ajax({
            url: processedLink,
            type: "POST",
            data: processedData,
            processData: false, // important
            contentType: false, // important
            error: function (xhr, status, error) { }
        });
    }
});

//** self defined function parameter empty/undefined/null validation */
function paramValidation(param) {
    if (!param || typeof param === "undefined") return false;
    else if (param == "") return false;
    else return true;
}
function GetCookieVal(offset) {
    var endstr = window.document.cookie.indexOf(";", offset);
    if (endstr == -1) endstr = window.document.cookie.length;
    return unescape(window.document.cookie.substring(offset, endstr));
}

function SetCookie(name, value, days, domain) {
    var expdate = new Date();

    if (days != null) expdate.setTime(expdate.getTime() + days * 24 * 60 * 60 * 1000);

    window.document.cookie = name + "=" + escape(value) + (days == null ? "" : ";  expires=" + expdate.toGMTString()) + "; path=/;  domain=" + domain;
}
function DelCookie(name, domain) {
    var date = new Date();
    date.setTime(date.getTime() - 10000);
    document.cookie = name + "=; expire=" + date.toGMTString() + "; path=/;domain=" + domain;
}

function GetCookie(name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = window.document.cookie.length;

    var i = window.document.cookie.indexOf(arg);
    while (i < clen) {
        var j = i + alen;
        if (window.document.cookie.substring(i, j) == arg) return GetCookieVal(j);
        i = window.document.cookie.indexOf("  ", i) + 1;
        if (i == 0) break;
    }
    return null;
}
function checkToken() {

    if (!paramValidation(GetCookie("token"))) {
        document.location.href = 'login.html';
    }

}

function checkMsg(msg) {
    if (msg == '200') {//success
        return true;
    } else {
        return false;
    }
}

function delete_all_cookie() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var equals = cookies[i].indexOf("=");
        var name = equals > -1 ? cookies[i].substr(0, equals) : cookies[i];
        DelCookie(name, domain);
    }
    document.location.href = 'login.html';
}

