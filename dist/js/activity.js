var token = GetCookie("token");
var domain = window.location.hostname;
function activity_edit_init() {
    $("#activity_table").DataTable({
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

    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 10, token: token },
        success: function (data) {
            var year_length = data.out.length;
            var y = new Date();
            var year_now = y.getFullYear() - 1911;
            if (year_length == 0) {
                var o = new Option(year_now, year_now)
                $("#year").append(o);
                o = new Option(year_now + 1, year_now + 1)
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

    //列出社群
    show_group_type();
}

$(document).on("change", "#year", function (event) {
    show_group_type();
});

function show_group_type() {
    $.ajax({
        type: "POST",
        url: "phpMod/activity_management.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 1, token: token, year: $("#year").val() },
        success: function (data) {
            var group_option='<option value="0">請選擇</option>';
            for (var i = 0; i < data.out.length; i++) {
                group_option = group_option + '<option value=' + data.out[i].sno_project + '>' + data.out[i].project_name + '</option>';
            }
            $("#group_type").html(group_option);
            $("#group_type").trigger("change");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    })
}

$(document).on("change", "#group_type", function (event) {
    if ($('#group_type').val() != 0)
        document.getElementById("insert_activity_area").style.display = "block";
    else if ($('#group_type').val() == 0)
        document.getElementById("insert_activity_area").style.display = "none";
    show_activity_table();
});

function show_activity_table() {
    $('#activity_table').dataTable().fnClearTable();
    var table = $('#activity_table').DataTable();
    $.ajax({
        type: "POST",
        url: "phpMod/activity_management.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 2, token: token, sno_project: $('#group_type').val() },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                var btn_string="";
                if(data.edit==1)
                    btn_string="<a class='btn bg-purple btn-xs' id='result_edit'>成果填寫</a>";
                else if(data.edit==0)
                    btn_string="<a style='margin-top:5%' class='btn bg-olive btn-xs' id='result_info'>詳細資料</a>";
                for (var i = 0; i < data.out.length; i++) {
                    console.log(data.edit);
                    var date = "";
                    if (data.out[i].plan_date_end != "0000-00-00" && data.out[i].plan_date_end != null)
                        date = data.out[i].plan_date + "至" + data.out[i].plan_date_end;
                    else
                        date = data.out[i].plan_date;
                    table.row.add([
                        data.out[i].sno_plan,
                        "<input type='checkbox' id='" + data.out[i].sno_plan + "' name='checkbox' />",
                        data.out[i].plan_text,
                        date,
                        data.out[i].plan_status,
                        btn_string
                    ]).draw();
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$("#new_group_btnadd").click(function () {
    if ($("#new_group_time").val() == "") {
        alert("請選擇活動時間");
        eval("document.getElementById('new_group_time').focus()");
        return false;
    }
    if ($("#new_group_description").val() == "") {
        alert("請輸入活動名稱");
        eval("document.getElementById('new_group_description').focus()");
        return false;
    }
    $.ajax({
        type: "POST",
        url: "phpMod/activity_management.php",
        async: false, ///非同步執行
        dataType: "json",
        data: {
            method: 3, token: token,
            sno_project: $('#group_type').val(),
            plan_text: $('#new_group_description').val(),
            plan_date: $('#new_group_time').val()
        },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                show_activity_table();
                $("#new_group_time").val("");
                $("#new_group_description").val("");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
})

$('#activity_table tbody').on('click', 'input[name="checkbox"]', function (e) {
    var table = $('#activity_table').DataTable();
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
    var table = $('#activity_table').DataTable();
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

$("#btndelete").click(function (e) {
    var delete_bool = confirm("確定要刪除資料嗎?");
    if (delete_bool == true) {
        var table = $('#activity_table').DataTable();
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
            url: "phpMod/activity_management.php",
            async: false,
            dataType: "json",
            data: { method: 7, token: token, sno_plan: id },
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

$("#activity_table tbody").on("click", "a#result_edit", function () {
    var table = $("#activity_table").DataTable();
    var data = table.row($(this).parents("tr")).data();
    SetCookie("activity_id", data[0], 1, domain);
    document.location.href = "activity_record.html";
});
$("#activity_table tbody").on("click", "a#result_info", function () {
    var table = $("#activity_table").DataTable();
    var data = table.row($(this).parents("tr")).data();
    SetCookie("activity_id", data[0], 1, domain);
    document.location.href = "activity_info.html";
});

//---------------activity_management.html---------------
var ckeditor;
var file_uploaded_index = false;
function activity_record_init() {
    ckeditor = CKEDITOR.replace('decription');
    show_activity_info();
}

function show_activity_info() {
    $.ajax({
        type: "POST",
        url: "phpMod/activity_management.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 5, token: token, sno_plan: GetCookie("activity_id") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                document.getElementById("sign_date").innerHTML = data.out["created_at"].split("-")[0] - 1911 + " 年 " + data.out["created_at"].split("-")[1] + " 月 " + data.out["created_at"].split("-")[2].split(" ")[0] + " 日";
                if (data.out["project_name"] != "") {
                    $("#group_name").val(data.out["project_name"]);
                }
                if (data.out["plan_date"] != "") {
                    $("#date_begin").val(data.out["plan_date"]);
                }
                if (data.out["plan_date_end"] != "") {
                    $("#date_end").val(data.out["plan_date_end"]);
                }
                if (data.out["plan_text"] != "") {
                    $("#activity_topic").val(data.out["plan_text"]);
                }
                if (data.out["plan_location"] != "") {
                    $("#activity_location").val(data.out["plan_location"]);
                }
                if (data.out["plan_people"] != "") {
                    $("#activity_people").val(data.out["plan_people"]);
                }
                if (data.out["plan_record"] != "") {
                    CKEDITOR.instances.decription.setData(data.out["plan_record"]);
                }
                if (data.out["file_path"] != "") {
                    $("#uploaded_form").append("<a href='" + data.out["file_path"] + "'>已上傳檔案</a>");
                    file_uploaded_index = true;
                }
                else if (data.out["file_path"] == "") {
                    $("#uploaded_form").append("<p>(尚未上傳過檔案)</p>");
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$("#activity_save").click(function () {
    if ($("#activity_topic").val() == "") {
        alert("請輸入活動主題");
        eval("document.getElementById('activity_topic').focus()");
        return false;
    }
    if ($("#date_begin").val() == "") {
        alert("請輸入活動起始時間");
        eval("document.getElementById('date_begin').focus()");
        return false;
    }
    if ($("#date_end").val() == "") {
        alert("請輸入活動結束時間");
        eval("document.getElementById('date_end').focus()");
        return false;
    }
    if ($("#activity_location").val() == "") {
        alert("請輸入活動地點");
        eval("document.getElementById('activity_location').focus()");
        return false;
    }
    if ($("#activity_people").val() == "") {
        alert("請輸入活動人數");
        eval("document.getElementById('activity_people').focus()");
        return false;
    }
    if (ckeditor.document.getBody().getText().trim() == "") {
        alert("活動內容簡述/討論紀錄");
        eval("ckeditor.document.getBody().focus()");
        return false;
    }
    if (file_uploaded_index == false && $("#upload_form").val() == "") {
        alert("請上傳簽到表");
        eval("document.getElementById('upload_form').focus()");
        return false;
    }

    $.ajax({
        type: "POST",
        url: "phpMod/activity_management.php",
        async: false, ///非同步執行
        dataType: "json",
        data: {
            method: 6, token: token,
            sno_plan: GetCookie("activity_id"),
            plan_text: $("#activity_topic").val(),
            plan_date: $("#date_begin").val(),
            plan_date_end: $("#date_end").val(),
            plan_location: $("#activity_location").val(),
            plan_people: $("#activity_people").val(),
            plan_record: ckeditor.document.getBody().getHtml()
        },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                uploadform();
                //alert("修改成功");
                //document.location.href = "activity_edit.html";
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
})

function uploadform() {
    var form = document.forms.namedItem("fileinfo");
    form.addEventListener(
        "submit",
        function (ev) {
            oData = new FormData(form);
            oData.append("method", 8);
            oData.append("token", token);
            oData.append("sno_plan", GetCookie("activity_id"));
            var oReq = new XMLHttpRequest();
            oReq.open("POST", "phpMod/activity_management.php", true);
            oReq.onload = function (oEvent) {
                if (oReq.status == 200) {
                    alert("修改成功");
                    document.location.href = "activity_edit.html";
                }
                else
                    alert("失敗");
            };
            oReq.send(oData);
            ev.preventDefault();
        },
        false
    );
}

$("#activity_cancel").click(function () {
    document.location.href = "activity_edit.html";
})

$("#activity_info_done").click(function () {
    document.location.href = "activity_edit.html";
})
