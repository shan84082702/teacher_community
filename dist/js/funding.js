var token = GetCookie("token");
var domain = window.location.hostname;
function funding_init() {
    $("#funding_table").DataTable({
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

    //列出年份
    $.ajax({
        type: "POST",
        url: "phpMod/funding.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 0, token: token },
        success: function (data) {
            var year_length = data.out.length;
            var y = new Date();
            var year_now = y.getFullYear() - 1911;
            if (year_length == 0) {
                var o = new Option(year_now, year_now)
                $("#year").append(o);
                o = new Option(year_now+1, year_now+1)
                $("#year").append(o);
                $("#year").val(year_now);
            }
            else {
                for (var i = 0; i < year_length; i++) {
                    var o = new Option(data.out[i].year, data.out[i].year)
                    $("#year").append(o);
                }
                $("#year").val(year_now);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    })

    show_funding_table();
}

$("#year").change(function () {
    show_funding_table();
});

function show_funding_table() {
    $('#funding_table').dataTable().fnClearTable();
    var table = $('#funding_table').DataTable();
    $.ajax({
        type: "POST",
        url: "phpMod/funding.php",
        async: false,
        dataType: "json",
        data: { method: 1, token: token, year: $('#year').val() },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    table.row.add([
                        data_array['sno_funding'],
                        "<input type='checkbox' id='" + data_array['sno_funding'] + "' name='checkbox' />",
                        data_array['funding_name'],
                        data_array['updated_at'],
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

$("#funding_btnadd").click(function () {
    if ($("#funding_name").val() == "") {
        alert("請輸入經費項目名稱");
        eval("document.getElementById('funding_name').focus()");
        return false;
    }
    var Today = new Date();
    $.ajax({
        type: "POST",
        url: "phpMod/funding.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 2, token: token, funding_name: $('#funding_name').val(), year: Today.getFullYear() - 1911 },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                show_funding_table();
                $("#funding_name").val("");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
})

$('#funding_table tbody').on('click', 'input[name="checkbox"]', function (e) {
    var table = $('#funding_table').DataTable();
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
    var table = $('#funding_table').DataTable();
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

$("#funding_btndelete").click(function (e) {
    var delete_bool = confirm("確定要刪除資料嗎?");
    if (delete_bool == true) {
        var table = $('#funding_table').DataTable();
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
            url: "phpMod/funding.php",
            async: false,
            dataType: "json",
            data: { method: 3, token: token, sno_funding: id },
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

$("#funding_table tbody").on("click", "a#edit", function () {
    var table = $("#funding_table").DataTable();
    var data = table.row($(this).parents("tr")).data();
    $.ajax({
        type: "POST",
        url: "phpMod/funding.php",
        async: false,
        dataType: "json",
        data: { method: 4, token: token, sno_funding: data[0] },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                $("#sno_funding").val(data.out["sno_funding"]);
                $("#funding_name").val(data.out["funding_name"]);
                $("#funding_btnedit").show();
                $("#funding_btneditcancel").show();
                $("#funding_btnadd").hide();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
});

$("#funding_btneditcancel").click(function (e) {
    var delete_bool = confirm("確定要取消編輯嗎?");
    if (delete_bool == true) {
        $("#sno_funding").val("");
        $("#funding_name").val("");
        $("#funding_btnedit").hide();
        $("#funding_btneditcancel").hide();
        $("#funding_btnadd").show();
    }
});

$("#funding_btnedit").click(function () {
    if ($("#funding_name").val() == "") {
        alert("請輸入經費項目名稱");
        eval("document.getElementById('funding_name').focus()");
        return false;
    }
    $.ajax({
        type: "POST",
        url: "phpMod/funding.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 5, token: token, funding_name: $('#funding_name').val(), sno_funding: $('#sno_funding').val() },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                alert("編輯成功!");
                show_funding_table();
                $("#sno_funding").val("");
                $("#funding_name").val("");
                $("#funding_btnedit").hide();
                $("#funding_btneditcancel").hide();
                $("#funding_btnadd").show();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
})