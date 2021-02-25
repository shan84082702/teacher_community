var token = GetCookie("token");
var domain = window.location.hostname;
function account_init() {
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

    showAcaOption();
    showPermission();
    show_account_table();
}

function showAcaOption() {
    var institute_option = "";
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
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
                    var sno_institute = data_array['sno_institute'];
                    var institute = data_array['institute'];
                    institute_option = institute_option + '<option value=' + sno_institute + '>' + institute + '</option>';
                }
                var aca_sno = "";
                aca_sno = data.out[0]['sno_institute'];
                $("#account_aca").html(institute_option);
                showDepOption(aca_sno);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

function showDepOption(aca) {
    var department_option = "";
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false,
        dataType: "json",
        data: { method: 4, token: token, sno_institute: aca },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    var sno_department = data_array['sno_department'];
                    var department = data_array['department'];
                    department_option = department_option + '<option value=' + sno_department + '>' + department + '</option>';
                }
                $("#account_department").html(department_option);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$(document).on('change', '.account_aca', function (event) {
    var index = this.value;
    showDepOption(index);
});

function showPermission() {
    var permission_option = "";
    $.ajax({
        type: "POST",
        url: "phpMod/account_management.php",
        async: false,
        dataType: "json",
        data: { method: 0, token: token },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    var sno_role = data_array['sno_role'];
                    var role_name = data_array['role_name'];
                    permission_option = permission_option + '<option value=' + sno_role + '>' + role_name + '</option>';
                }
                $("#account_permission").html(permission_option);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

function show_account_table() {
    $('#account_table').dataTable().fnClearTable();
    var table = $('#account_table').DataTable();
    $.ajax({
        type: "POST",
        url: "phpMod/account_management.php",
        async: false,
        dataType: "json",
        data: { method: 1, token: token },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    table.row.add([
                        data_array['sno_member'],
                        "<input type='checkbox' id='" + data_array['sno_member'] + "' name='checkbox' />",
                        data_array['name'],
                        data_array['institute'] + " " + data_array['department'],
                        data_array['title'],
                        "辦公室分機:" + data_array['office'] + "<br>手機：" + data_array['phone'],
                        data_array['email'],
                        "<a class='btn btn-warning btn-xs' id='edit'>編輯</a> "
                    ]).draw();
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$("#account_btnadd").click(function () {
    if ($("#account_name").val() == "") {
        alert("請輸入人員姓名");
        eval("document.getElementById('account_name').focus()");
        return false;
    }
    if ($("#account_title").val() == "") {
        alert("請輸入人員稱謂");
        eval("document.getElementById('account_title').focus()");
        return false;
    }
    if ($("#account_phone").val() == "") {
        alert("請輸入人員辦公室分機");
        eval("document.getElementById('account_phone').focus()");
        return false;
    }
    if ($("#account_cellphone").val() == "") {
        alert("請輸入人員手機號碼");
        eval("document.getElementById('account_cellphone').focus()");
        return false;
    }
    if ($("#account_email").val() == "") {
        alert("請輸入人員電子郵件信箱");
        eval("document.getElementById('account_email').focus()");
        return false;
    }
    if ($("#account_email").val().search(/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/) == -1) {
		alert("電子郵件信箱格式錯誤");
		eval("document.getElementById('account_email').focus()");
		return false;
	}
    $.ajax({
        type: "POST",
        url: "phpMod/account_management.php",
        async: false, ///非同步執行
        dataType: "json",
        data: {
            method: 2, token: token, account_name: $('#account_name').val(),
            account_title: $('#account_title').val(),
            account_department: $('#account_department').val(),
            account_phone: $('#account_phone').val(),
            account_cellphone: $('#account_cellphone').val(),
            account_email: $('#account_email').val(),
            account_permission: $('#account_permission').val()
        },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                showAcaOption();
                showPermission();
                show_account_table();
                $("#account_name").val("");
                $("#account_title").val("");
                $("#account_phone").val("");
                $("#account_cellphone").val("");
                $("#account_id").val("");
                $("#account_email").val("");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
})

$('#account_table tbody').on('click', 'input[name="checkbox"]', function (e) {
    var table = $('#account_table').DataTable();
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
    var table = $('#account_table').DataTable();
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

$("#account_btndelete").click(function (e) {
    var delete_bool = confirm("確定要刪除資料嗎?");
    if (delete_bool == true) {
        var table = $('#account_table').DataTable();
        var $table = table.table().node();
        var $chkbox_all = $('tbody input[name="checkbox"]', $table);
        var $chkbox_checked = $('tbody input[name="checkbox"]:checked', $table);
        var chkbox_select_all = $('thead input[id="CheckAll"]', $table).get(0);
        var Data = table.rows('.selected').data();
        var id = [];
        for (var i = 0; i < Data.length; i++) {
            id.push(Data[i][0]);
        }
        $.ajax({
            type: "POST",
            url: "phpMod/account_management.php",
            async: false,
            dataType: "json",
            data: { method: 3, token: token, sno_member: id },
            success: function (data) {
                if (!checkMsg(data.msg)) {
                    delete_all_cookie();
                }
                if (checkMsg(data.msg)) {
                    table.rows('.selected').remove().draw(false);
                    chkbox_select_all.checked = false;
                    chkbox_select_all.indeterminate = false;
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
            }
        });
    }
});

$("#account_table tbody").on("click", "a#edit", function () {
    var table = $("#account_table").DataTable();
    var data = table.row($(this).parents("tr")).data();
    $.ajax({
        type: "POST",
        url: "phpMod/account_management.php",
        async: false,
        dataType: "json",
        data: { method: 4, token: token, sno_member: data[0] },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                $("#account_name").val(data.out["name"]);
                $("#account_title").val(data.out["title"]);
                $("#account_aca").val(data.out["sno_institute"]);
                $("#account_department").val(data.out["sno_subject"]);
                $("#account_phone").val(data.out["office"]);
                $("#account_cellphone").val(data.out["phone"]);
                $("#account_id").val(data.out["sno_member"]);
                $("#account_email").val(data.out["email"]);
                $("#account_permission").val(data.out["sno_role"]);
                $("#account_btnedit").show();
                $("#account_btneditcancel").show();
                $("#account_btnadd").hide();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
});

$("#account_btneditcancel").click(function (e) {
    var delete_bool = confirm("確定要取消編輯嗎?");
    if (delete_bool == true) {
        $("#account_name").val("");
        $("#account_title").val("");
        $("#account_phone").val("");
        $("#account_cellphone").val("");
        $("#account_id").val("");
        $("#account_email").val("");
        showAcaOption();
        showPermission();
        $("#account_btnedit").hide();
        $("#account_btneditcancel").hide();
        $("#account_btnadd").show();
    }
});

$("#account_btnedit").click(function () {
    if ($("#account_name").val() == "") {
        alert("請輸入人員姓名");
        eval("document.getElementById('account_name').focus()");
        return false;
    }
    if ($("#account_title").val() == "") {
        alert("請輸入人員稱謂");
        eval("document.getElementById('account_title').focus()");
        return false;
    }
    if ($("#account_phone").val() == "") {
        alert("請輸入人員辦公室分機");
        eval("document.getElementById('account_phone').focus()");
        return false;
    }
    if ($("#account_cellphone").val() == "") {
        alert("請輸入人員手機號碼");
        eval("document.getElementById('account_cellphone').focus()");
        return false;
    }
    if ($("#account_email").val() == "") {
        alert("請輸入人員電子郵件信箱");
        eval("document.getElementById('account_email').focus()");
        return false;
    }
    $.ajax({
        type: "POST",
        url: "phpMod/account_management.php",
        async: false, ///非同步執行
        dataType: "json",
        data: {
            method: 5, token: token, account_name: $('#account_name').val(),
            account_title: $('#account_title').val(),
            account_department: $('#account_department').val(),
            account_phone: $('#account_phone').val(),
            account_cellphone: $('#account_cellphone').val(),
            account_email: $('#account_email').val(),
            account_permission: $('#account_permission').val(),
            sno_member: $('#account_id').val()
        },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                showAcaOption();
                showPermission();
                show_account_table();
                $("#account_name").val("");
                $("#account_title").val("");
                $("#account_phone").val("");
                $("#account_cellphone").val("");
                $("#account_id").val("");
                $("#account_email").val("");
                $("#account_btnedit").hide();
                $("#account_btneditcancel").hide();
                $("#account_btnadd").show();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
})