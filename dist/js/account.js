var domain = window.location.hostname;
$("#login_btn").click(function () {
    var account = $("#login_username").val();
    var password = $("#password").val();
    var method = 1;
    if (account.trim() == "") {
        alert("請輸入帳號");
        eval("document.getElementById('login_username').focus()");
        return false;
    }
    if (password.trim() == "") {
        alert("請輸入密碼");
        eval("document.getElementById('password').focus()");
        return false;
    }
    $.ajax({
        type: "POST",
        url: "phpMod/account.php",
        async: false,
        dataType: "json",
        data: { account: account, password: password, method: method },
        success: function (data) {
            if (checkMsg(data.msg)) {
                SetCookie("token", data.token, 1, domain);
                SetCookie("user_name", data.name, 1, domain);
                SetCookie("role_name", data.title, 1, domain);
                SetCookie("user_id", data.id, 1, domain);
                document.location.href = "index.html";
            } else {
                alert("帳號密碼錯誤");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
});

function account_init(){
    $("#account_table").DataTable({
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: false,
        info: true,
        autoWidth: false,
        columnDefs: [
            {
                targets: [0],
                visible: false
            }
        ],
        oLanguage: {
            sProcessing: "處理中...",
            sLengthMenu: "顯示 _MENU_ 項結果",
            sZeroRecords: "沒有匹配結果",
            sInfo: "顯示第 _START_ 至 _END_ 項結果，共 _TOTAL_ 項",
            sInfoEmpty: "顯示第 0 至 0 項結果，共 0 項",
            sInfoFiltered: "(從 _MAX_ 項結果過濾)",
            sSearch: "搜尋:",
            oPaginate: {
                sFirst: "首頁",
                sPrevious: "上一頁",
                sNext: "下一頁",
                sLast: "尾頁"
            }
        }
    });
}