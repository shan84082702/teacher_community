var token = GetCookie("token");
var domain = window.location.hostname;
checkToken();
var user_name = GetCookie("user_name");
$("#username").text(user_name);
var usertitle = GetCookie("role_name");
$('#usertitle').text(usertitle);
$("#logout_btn").click(function () {
    var method=3;
    $.ajax({
        type: "POST",
        url: "phpMod/account.php",
        async: false,
        dataType: "json",
        data: { token: token, method: method },
        success: function (data) {
            if (checkMsg(data.msg)) {
                delete_all_cookie();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
});

function getMenu(page) {
    $.ajax({
        type: "POST",
        url: "phpMod/menu.php",
        async: false,
        dataType: "json",
        data: { token: token, page: page, role: GetCookie("role_name") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                var menu = data.remenu;
                $("#menu").append(menu);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}
