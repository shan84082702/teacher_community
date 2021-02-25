var token = GetCookie("token");
var domain = window.location.hostname;

function index_init() {
    $("#information_mail").DataTable({
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: false,
        info: true,
        autoWidth: true,
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
    get_mailtable();
}
function get_mailtable() {
    $('#information_mail').dataTable().fnClearTable();
    var table = $('#information_mail').DataTable();
    $.ajax({
        type: "POST",
        url: "phpMod/email.php",
        async: false,
        dataType: "json",
        data: { method: 3, token: token },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    table.row.add([
                        data_array['sno_message'],
                        data_array['name'],
                        data_array['created_at'],
                        data_array['project_name'],
                        "<button class='btn btn-success btn-sm' data-target='#modal-information'\
                        data-toggle='modal' id='detail' type='button'>詳細資訊</button>"
                    ]).draw();
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$("#information_mail tbody").on("click", "button#detail", function () {
    var table = $("#information_mail").DataTable();
    var data = table.row($(this).parents("tr")).data();
    $.ajax({
        type: "POST",
        url: "phpMod/email.php",
        async: false,
        dataType: "json",
        data: { method: 4, token: token, sno_message: data[0] },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                $("#topic").val(data.out["message_header"]);
                $("#time").val(data.out["created_at"]);
                $("#sender").val(data.out["name"] + "(" + data.out["email"] + ")");
                $("#sender_id").val(data.out["message_sender"]);
                $("#project_id").val(data.out["sno_project"]);
                $("#index_information_detail").val(data.out["message_content"]);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
});

$("#reply_btn").click(function (e) {
    $("#re_recipient").val($("#sender").val());
    $("#re_topic").val("RE:" + $("#topic").val());
    $("#recipient_id").val($("#sender_id").val());
    $("#re_project_id").val($("#project_id").val());
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 6, token: token, sno_member: GetCookie("user_id") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                $("#re_sender").val(data.out["name"] + "(" + data.out["email"] + ")");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
});

$("#send_btn").click(function (e) {
    if ($("#re_topic").val() == "") {
        alert("請輸入主旨");
        eval("document.getElementById('re_topic').focus()");
        return false;
    }
    if ($("#index_information_detail2").val() == "") {
        alert("請輸入信件內容");
        eval("document.getElementById('index_information_detail2').focus()");
        return false;
    }
    var id = [];
    id.push($("#recipient_id").val());
    $.ajax({
        type: "POST",
        url: "phpMod/email.php",
        async: false, ///非同步執行
        dataType: "json",
        data: {
            method: 0, sno_member_s: id, message_header: $("#re_topic").val(), token: token,
            message_content: $("#index_information_detail2").val(), sno_project: $("#re_project_id").val()
        },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                alert("寄信成功!");
                $("#re_topic").val("");
                $("#index_information_detail2").val("");
                $('#modal-information').modal('hide');
                $('#modal-reply').modal('hide');
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
});

//----------index2.html----------
function index2_init() {
    $("#information_mail2").DataTable({
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: false,
        info: true,
        autoWidth: true,
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

    $.ajax({
        type: "POST",
        url: "phpMod/email.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 1, token: token },
        success: function (data) {
            var length = data.out.length;
            for (var i = 0; i < length; i++) {
                var o = new Option(data.out[i].project_name, data.out[i].sno_project)
                $("#type").append(o);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    })
}

$("#type").change(function () {
    get_mail2table();
});
function get_mail2table() {
    $('#information_mail2').dataTable().fnClearTable();
    var table = $('#information_mail2').DataTable();
    $.ajax({
        type: "POST",
        url: "phpMod/email.php",
        async: false,
        dataType: "json",
        data: { method: 2, token: token, sno_project: $('#type').val() },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    if (data_array['sno_member'] != GetCookie("user_id")) {
                        table.row.add([
                            data_array['sno_member'],
                            "<input type='checkbox' id='" + data_array['sno_member'] + "' name='checkbox' />",
                            data_array['name'],
                            data_array['institute'] + " " + data_array['department'],
                            data_array['title'],
                            "辦公室分機:" + data_array['office'] + "<br>手機：" + data_array['phone'],
                            data_array['email']
                        ]).draw();
                    }
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$('#information_mail2 tbody').on('click', 'input[name="checkbox"]', function (e) {
    var table = $('#information_mail2').DataTable();
    var $row = $(this).closest('tr');
    if (this.checked) {
        $row.addClass('selected');
    }
    else {
        $row.removeClass('selected');
    }
    updateDataTableSelectAllCtrl(table);
});

$("#CheckAll").click(function () {
    var table = $('#information_mail2').DataTable();
    if ($("#CheckAll").prop("checked")) {
        $("input[name='checkbox']").each(function () {
            $(this).prop("checked", true);
            $(this).closest('tr').addClass('selected');
        })
    }
    else {
        $("input[name='checkbox']").each(function () {
            $(this).prop("checked", false);
            $(this).closest('tr').removeClass('selected');
        })
    }
});

function updateDataTableSelectAllCtrl(table) {
    var $table = table.table().node();
    var $chkbox_all = $('tbody input[name="checkbox"]', $table);
    var $chkbox_checked = $('tbody input[name="checkbox"]:checked', $table);
    var chkbox_select_all = $('thead input[id="CheckAll"]', $table).get(0);
    if ($chkbox_checked.length === 0) {
        chkbox_select_all.checked = false;
        if ('indeterminate' in chkbox_select_all) {
            chkbox_select_all.indeterminate = false;
        }
    } else if ($chkbox_checked.length === $chkbox_all.length) {
        chkbox_select_all.checked = true;
        if ('indeterminate' in chkbox_select_all) {
            chkbox_select_all.indeterminate = false;
        }
    } else {
        chkbox_select_all.checked = true;
        if ('indeterminate' in chkbox_select_all) {
            chkbox_select_all.indeterminate = true;
        }
    }
}

var id = [];
$("#send_mail").click(function (e) {
    var table = $('#information_mail2').DataTable();
    var $table = table.table().node();
    var $chkbox_all = $('tbody input[name="checkbox"]', $table);
    var $chkbox_checked = $('tbody input[name="checkbox"]:checked', $table);
    var chkbox_select_all = $('thead input[id="CheckAll"]', $table).get(0);
    var Data = table.rows('.selected').data();
    id = [];
    for (var i = 0; i < Data.length; i++) {
        id.push(Data[i][0]);
    }
    if (id.length == 0) {
        alert("請選取收信者!");
    }
    else {
        $('#modal-information2').modal('show');
        $("#project_id2").val($("#type").val());
        $.ajax({
            type: "POST",
            url: "phpMod/group_apply.php",
            async: false, ///非同步執行
            dataType: "json",
            data: { method: 6, token: token, sno_member: GetCookie("user_id") },
            success: function (data) {
                if (!checkMsg(data.msg)) {
                    delete_all_cookie();
                }
                if (checkMsg(data.msg)) {
                    $("#sender2").val(data.out["name"] + "(" + data.out["email"] + ")");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
            }
        });
        $.ajax({
            type: "POST",
            url: "phpMod/email.php",
            async: false,
            dataType: "json",
            data: { method: 5, token: token, sno_member_s: id },
            success: function (data) {
                if (!checkMsg(data.msg)) {
                    delete_all_cookie();
                }
                if (checkMsg(data.msg)) {
                    chkbox_select_all.checked = false;
                    chkbox_select_all.indeterminate = false;
                    var recipient_string="";
                    for (var i = 0; i < data.out.length; i++) {
                        var data_array = data.out[i];
                        if(i==0){
                            recipient_string=data_array['name']+"("+data_array['email']+")";
                        }
                        else{
                            recipient_string+=","+data_array['name']+"("+data_array['email']+")";
                        }
                    }
                    $("#recipient2").val(recipient_string);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
            }
        });
    }
});

$("#send_btn2").click(function (e) {
    if ($("#topic2").val() == "") {
        alert("請輸入主旨");
        eval("document.getElementById('topic2').focus()");
        return false;
    }
    if ($("#index2_information_detail").val() == "") {
        alert("請輸入信件內容");
        eval("document.getElementById('index2_information_detail').focus()");
        return false;
    }
    $.ajax({
        type: "POST",
        url: "phpMod/email.php",
        async: false, ///非同步執行
        dataType: "json",
        data: {
            method: 0, sno_member_s: id, message_header: $("#topic2").val(), token: token,
            message_content: $("#index2_information_detail").val(), sno_project: $("#project_id2").val()
        },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                alert("寄信成功!");
                $("#topic2").val("");
                $("#index2_information_detail").val("");
                $('#modal-information2').modal('hide');
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
});