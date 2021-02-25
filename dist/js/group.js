var token = GetCookie("token");
var domain = window.location.hostname;
//---------------group_edit.html---------------
function group_edit_init() {
    //設定成果報告列表格式
    $("#report_table").DataTable({
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

    //列出年度下拉是選單的年份
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 10, token: token },
        success: function (data) {
            var year_length = data.out.length;
            console.log(year_length);
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
                    var o = new Option(data.out[i].year, data.out[i].year);
                    $("#year").append(o);
                }
                $("#year").val(year_now);
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    })
    //取得成果報告列表資料
    get_grouplist();
}

//選取年份變更→成果報告列表變更
$("#year").change(function () {
    get_grouplist();
});

//點選"社群計畫申請"按鈕 取的新的申請表編號 存在cookie(group_id)中
$("#btnapply").click(function () {
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 0, token: token, year: GetCookie("year") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                SetCookie("group_id", data.sno_project, 1, domain);
                document.location.href = "group_apply1.html";
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
})

$("#report_table tbody").on("click", "a#edit", function () {
    var table = $("#report_table").DataTable();
    var data = table.row($(this).parents("tr")).data();
    SetCookie("group_id", data[0], 1, domain);
    SetCookie("year", $("#year").val(), 1, domain);
    document.location.href = "group_apply1.html";
});

$("#report_table tbody").on("click", "a#detail", function () {
    var table = $("#report_table").DataTable();
    var data = table.row($(this).parents("tr")).data();
    SetCookie("group_id", data[0], 1, domain);
    SetCookie("year", $("#year").val(), 1, domain);
    document.location.href = "group_info1.html";
});

$("#report_table tbody").on("click", "a#result", function () {
    var table = $("#report_table").DataTable();
    var data = table.row($(this).parents("tr")).data();
    SetCookie("group_id", data[0], 1, domain);
    SetCookie("year", $("#year").val(), 1, domain);
    document.location.href = "report1.html";
});

function get_grouplist() {
    $('#report_table').dataTable().fnClearTable();
    var year = $("#year").val();
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 1, token: token, year: year },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                var t = $("#report_table").DataTable();
                for (var i = 0; i < data.out.length; i++) {
                    var group_id = data.out[i].sno_project;
                    var group_name = data.out[i].project_name;
                    var group_status = data.out[i].project_status;
                    var group_approval = data.out[i].project_approval;
                    var update_at = data.out[i].updated_at;
                    var group_time = data.out[i].project_time;
                    var btn_string="";
                    if(group_approval==1){
                        btn_string="<a class='btn bg-olive btn-xs' id='detail'>詳細資料</a>" +
                        "<a style='margin-top:5%;' class='btn bg-purple btn-xs' id='result'>成果填寫</a>";
                    }
                    else{
                        btn_string="<a class='btn btn-warning btn-xs' id='edit'>編輯</a> " +
                        "<a style='margin-top:5%' class='btn bg-olive btn-xs' id='detail'>詳細資料</a>";
                    }
                    t.row.add([
                        group_id,
                        "<input type='checkbox' id='" + group_id + "' name='group_checkbox' />",
                        group_name,
                        update_at,
                        group_time.split(",")[0] + "<br/>至<br/>" + group_time.split(",")[1],
                        group_status,
                        group_approval,
                        btn_string
                    ]).draw(false);
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$('#report_table tbody').on('click', 'input[name="group_checkbox"]', function (e) {
    var table = $('#report_table').DataTable();
    var $row = $(this).closest('tr');
    if (this.checked) {
        $row.addClass('selected');
    }
    else {
        $row.removeClass('selected');
    }
    group_updateDataTableSelectAllCtrl(table);
});

$("#group_CheckAll").click(function () {
    var table = $('#report_table').DataTable();
    if ($("#group_CheckAll").prop("checked")) {
        $("input[name='group_checkbox']").each(function () {
            $(this).prop("checked", true);
            $(this).closest('tr').addClass('selected');
        })
    }
    else {
        $("input[name='group_checkbox']").each(function () {
            $(this).prop("checked", false);
            $(this).closest('tr').removeClass('selected');
        })
    }
});

function group_updateDataTableSelectAllCtrl(table) {
    var $table = table.table().node();
    var $chkbox_all = $('tbody input[name="group_checkbox"]', $table);
    var $chkbox_checked = $('tbody input[name="group_checkbox"]:checked', $table);
    var chkbox_select_all = $('thead input[id="group_CheckAll"]', $table).get(0);
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

$("#group_btndelete").click(function (e) {
    var delete_bool = confirm("確定要刪除資料嗎?");
    if (delete_bool == true) {
        var table = $('#report_table').DataTable();
        var $table = table.table().node();
        var $chkbox_all = $('tbody input[name="group_checkbox"]', $table);
        var $chkbox_checked = $('tbody input[name="group_checkbox"]:checked', $table);
        var chkbox_select_all = $('thead input[id="group_CheckAll"]', $table).get(0);
        var Data = table.rows('.selected').data();
        var id = [];
        for (var i = 0; i < Data.length; i++) {
            id.push(Data[i][0]);
        }
        $.ajax({
            type: "POST",
            url: "phpMod/group_apply.php",
            async: false, ///非同步執行
            dataType: "json",
            data: { method: 23, token: token, sno_project: id },
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
//---------------group_apply1.html---------------
function group_apply_1_init() {
    $("#member_table").DataTable({
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
    //取得今天日期
    var Today = new Date();
    document.getElementById("apply_year").innerHTML = " ___ 年 ";
    document.getElementById("sign_date").innerHTML = Today.getFullYear() - 1911 + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日";
    showAcaOption(0);
    var id = GetCookie('user_id');
    show_gp1_info();
    getProfile(id, 0);
    show_member_table();
}

function show_gp1_info() {
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 19, token: token, sno_project: GetCookie("group_id") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                if (data.out["project_name"] != "") {
                    $("#gname").val(data.out["project_name"]);
                    document.getElementById("apply_year").innerHTML = data.out["year"]+ " 年 ";
                    document.getElementById("sign_date").innerHTML = data.out["created_at"].split("-")[0] - 1911 + " 年 " + data.out["created_at"].split("-")[1] + " 月 " + data.out["created_at"].split("-")[2].split(" ")[0] + " 日";
                }
                if (data.out["project_time"] != "") {
                    $("#timestart").val(data.out["project_time"].split(",")[0]);
                    $("#timeend").val(data.out["project_time"].split(",")[1]);
                }
                if (data.out["project_type"] != "") {
                    if (data.out["project_type"] == 1 || data.out["project_type"] == 2 || data.out["project_type"] == 3)
                        $("input[name='group_class']").get(data.out["project_type"] - 1).checked = true;
                    else {
                        $("input[name='group_class']").get(3).checked = true;
                        $("#group_class_others").val(data.out["project_type"]);
                    }
                }
                if (data.out["assistant"] != "0") {
                    $("#ga_aca").val(data.out["assistant_sno_institute"]);
                    $('#ga_aca').trigger("change");
                    $("#ga_department").val(data.out["assistant_sno_department"]);
                    $('#ga_department').trigger("change");
                    $("#ga_name").val(data.out["assistant_name"]);
                    $('#ga_name').trigger("change");
                    $("#ga_works").val(data.out["assistant_desc"]);
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

//type=0召集人 type=1社群助理 type=2成員資料
function getProfile(id, type) {
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 6, token: token, sno_member: id },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                var name = data.out["name"];
                var email = data.out["email"];
                var institute = data.out["institute"];
                var department = data.out["department"];
                var title = data.out["title"];
                var office = data.out["office"];
                var phone = data.out["phone"];
                if (type == 0) {
                    $("#leader_name").val(name);
                    $("#leader_email").val(email);
                    $("#leader_academic").val(institute);
                    $("#leader_department").val(department);
                    $("#leader_title").val(title);
                    $("#leader_office").val(office);
                    $("#leader_phone").val(phone);
                }
                else if (type == 1) {
                    $("#ga_email").val(email);
                    $("#ga_title").val(title);
                    $("#ga_tel").val(phone); //社群助理的電話不知道會存在phone還是office
                }
                else if (type == 2) {
                    $("#new_email").val(email);
                    $("#new_title").val(title);
                    $("#new_office").val(office);
                    $("#new_phone").val(phone);
                }

            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

//type=0網頁載入時 type=1清空成員資料填寫處 初始化下拉式選單
function showAcaOption(type) {
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
                if (type == 0) {
                    $("#ga_aca").html(institute_option);
                    showDepOption("ga_department", aca_sno, 0);
                    $("#new_aca").html(institute_option);
                    showDepOption("new_department", aca_sno, 0);
                }
                else if (type == 1) {
                    $("#new_aca").html(institute_option);
                    showDepOption("new_department", aca_sno, 2);
                }

            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

//type=0網頁載入時呼叫 type=1更改學院選項時呼叫 type=2清空成員資料填寫處 初始化下拉式選單
function showDepOption(id, aca, type) {
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
                $("#" + id).html(department_option);

                if (type == 0) {
                    var dept_sno = "";
                    dept_sno = data.out[0]['sno_department'];
                    showTeacherOption("ga_name", dept_sno);
                    showTeacherOption("new_name", dept_sno);
                }
                else if (type == 2) {
                    var dept_sno = "";
                    dept_sno = data.out[0]['sno_department'];
                    showTeacherOption("new_name", dept_sno);
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$(document).on('change', '.aca_option', function (event) {
    var index = this.value;
    var dept_id = $(this).next().next().attr('id');
    showDepOption(dept_id, index, 1);
    $('#' + dept_id).trigger("change");
    if ($(this).attr('id') == 'ga_aca')
        clearAssistentInfo();
    else if ($(this).attr('id') == 'new_aca')
        clearMemberInfo();
});

function clearAssistentInfo() {
    $("#ga_email").val("");
    $("#ga_tel").val("");
    $("#new_works").val("");
}

function clearMemberInfo() {
    $("#new_email").val("");
    $("#new_title").val("");
    $("#new_office").val("");
    $("#new_phone").val("");
}

function showTeacherOption(id, dept) {
    var teacher_option = "<option value='0'>請選擇</option>";
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false,
        dataType: "json",
        data: { method: 5, token: token, sno_department: dept },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    var sno_member = data_array['sno_member'];
                    var name = data_array['name'];
                    teacher_option = teacher_option + '<option value=' + sno_member + '>' + name + '</option>';
                }
                $("#" + id).html(teacher_option);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$(document).on('change', '.dept_option', function (event) {
    var index = this.value;
    var teacher_id = "";
    if ($(this).attr('id') == "ga_department") {
        teacher_id = "ga_name";
        clearAssistentInfo();
    }
    else {
        teacher_id = "new_name";
        clearMemberInfo();
    }
    showTeacherOption(teacher_id, index);
});

$(document).on('change', '.teacher_option', function (event) {
    var index = this.value;
    var id = $(this).attr('id');
    if (id == "ga_name") {
        getProfile(index, 1);
    }
    else {
        getProfile(index, 2);
    }
});

$("#btnadd").click(function () {
    /*   var sno_member = [];
       var name_id = $("#new_name").val();
       sno_member.push(name_id);
       var sno_project = GetCookie("group_id");
       $.ajax({
           type: "POST",
           url: "phpMod/group_apply.php",
           async: false, ///非同步執行
           dataType: "json",
           data: { method: 7, token: token, sno_member_s: sno_member, sno_project: sno_project },
           success: function (data) {
               if (!checkMsg(data.msg)) {
                   delete_all_cookie();
               }
               if (checkMsg(data.msg)) {
                   clear_son_member(true);
               }
           },
           error: function (XMLHttpRequest, textStatus, errorThrown) {
               alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
           }
       });*/
    if ($("#new_name").val() == 0) {
        alert("請選擇一名成員");
        eval("document.getElementById('new_name').focus()");
        return false;
    }
    var sno_member = $("#new_name").val();
    var name = $("#new_name").find(':selected').text();
    var institute = $("#new_aca").find(':selected').text();
    var department = $("#new_department").find(':selected').text();
    var title = $("#new_title").val();
    var office = $("#new_office").val();
    var phone = $("#new_phone").val();
    var email = $("#new_email").val();
    var table = $('#member_table').DataTable();
    table.row.add([
        sno_member,
        "<input type='checkbox' id='" + sno_member + "' name='checkbox' />",
        name,
        institute + "<br>" + department,
        title,
        "辦公室:" + office + "<br>手機:" + phone,
        email
    ]).draw();
    clear_son_member();
})

function clear_son_member() {
    showAcaOption(1);
    clearMemberInfo();
}

function show_member_table() {
    $('#member_table').dataTable().fnClearTable();
    var table = $('#member_table').DataTable();
    var sno_project = GetCookie("group_id");
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false,
        dataType: "json",
        data: { method: 9, token: token, sno_project: sno_project },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    var sno_member = data_array['sno_member'];
                    var name = data_array['name'];
                    var email = data_array['email'];
                    var institute = data_array['institute'];
                    var department = data_array['department'];
                    var title = data_array['title'];
                    var office = data_array['office'];
                    var phone = data_array['phone'];
                    table.row.add([
                        sno_member,
                        "<input type='checkbox' id='" + sno_member + "' name='checkbox' />",
                        name,
                        institute + department,
                        title,
                        "辦公室:" + office + "<br>手機：" + phone,
                        email
                    ]).draw();
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$('#member_table tbody').on('click', 'input[name="checkbox"]', function (e) {
    var table = $('#member_table').DataTable();
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
    var table = $('#member_table').DataTable();
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
        var table = $('#member_table').DataTable();
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
            url: "phpMod/group_apply.php",
            async: false,
            dataType: "json",
            data: { method: 8, token: token, sno_member_s: id, sno_project: GetCookie("group_id") },
            success: function (data) {
                if (!checkMsg(data.msg)) {
                    delete_all_cookie();
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
            }
        });
        table.rows('.selected').remove().draw(false);
        chkbox_select_all.checked = false;
        chkbox_select_all.indeterminate = false;
    }
});

$(document).on('change', '#timestart', function (event) {
    document.getElementById("apply_year").innerHTML = $("#timestart").val().split("-")[0] - 1911+" 年 ";
});

$("#next").click(function () {
    var sno_project = GetCookie("group_id");
    if ($("#gname").val() == "") {
        alert("請輸入社群名稱");
        eval("document.getElementById('gname').focus()");
        return false;
    }
    if ($("#timestart").val() == "") {
        alert("請輸入執行時間");
        eval("document.getElementById('timestart').focus()");
        return false;
    }
    if ($("#timeend").val() == "") {
        alert("請輸入執行時間");
        eval("document.getElementById('timeend').focus()");
        return false;
    }
    if ($("input[name='group_class']:checked").length == 0) {
        alert("請選擇社群類別");
        eval("document.getElementById('group_class').focus()");
        return false;
    }
    if ($("#ga_name").val() == 0) {
        alert("請選擇社群助理");
        eval("document.getElementById('ga_name').focus()");
        return false;
    }
    var project_name = $("#gname").val();
    var project_time = $("#timestart").val() + "," + $("#timeend").val();
    var project_type = $("input[name='group_class']:checked").val();
    if (project_type == 4) {
        project_type = $("#group_class_others").val();
    }
    var assistant = $("#ga_name").val();
    var assistant_desc = $("#ga_works").val();
    var group_year = $("#timestart").val().split("-")[0] - 1911
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false,
        dataType: "json",
        data: {
            method: 2, token: token, sno_project: sno_project,
            project_name: project_name, project_time: project_time, project_type: project_type,
            assistant: assistant, assistant_desc: assistant_desc, year: group_year
        },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                var table = $('#member_table').DataTable();
                var data = table.rows().data();
                var id = [];
                for (var i = 0; i < data.length; i++) {
                    id.push(data[i][0]);
                }
                $.ajax({
                    type: "POST",
                    url: "phpMod/group_apply.php",
                    async: false, ///非同步執行
                    dataType: "json",
                    data: { method: 7, token: token, sno_member_s: id, sno_project: sno_project },
                    success: function (data) {
                        if (!checkMsg(data.msg)) {
                            delete_all_cookie();
                        }
                        if (checkMsg(data.msg)) {
                            SetCookie("year", group_year, 1, domain);
                            document.location.href = "group_apply2.html";
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
                    }
                });
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });


})

//---------------group_apply2.html---------------
var ckeditor1;
var ckeditor2;
var ckeditor4;
function group_apply_2_init() {
    ckeditor1 = CKEDITOR.replace('purpose');
    ckeditor2 = CKEDITOR.replace('predicted');
    ckeditor4 = CKEDITOR.replace('result');
    $("#activity_edit").DataTable({
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
    show_gp2_info();
    show_activity_table();
}

function show_gp2_info() {
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 20, token: token, sno_project: GetCookie("group_id") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                if (data.out["project_d1"] != "")
                    CKEDITOR.instances.purpose.setData(data.out["project_d1"]);
                if (data.out["project_d2"] != "")
                    CKEDITOR.instances.predicted.setData(data.out["project_d2"]);
                if (data.out["project_d4"] != "")
                    CKEDITOR.instances.result.setData(data.out["project_d4"]);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

function show_activity_table() {
    $('#activity_edit').dataTable().fnClearTable();
    var table = $('#activity_edit').DataTable();
    var sno_project = GetCookie("group_id");
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false,
        dataType: "json",
        data: { method: 14, token: token, sno_project: sno_project },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    var sno_plan = data_array['sno_plan'];
                    var plan_date = data_array['plan_date'];
                    var plan_text = data_array['plan_text'];
                    table.row.add([
                        sno_plan,
                        "<input type='checkbox' id='" + sno_plan + "' name='gp2_checkbox' />",
                        plan_date,
                        plan_text
                    ]).draw();
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$("#gp2_btnadd").click(function () {
    var sno_project = GetCookie("group_id");
    if ($("#gp2_time").val() == "") {
        alert("請輸入活動時間");
        eval("document.getElementById('gp2_time').focus()");
        return false;
    }
    if ($("#gp2_description").val() == "") {
        alert("請輸入活動內容敘述");
        eval("document.getElementById('gp2_description').focus()");
        return false;
    }
    var date = $('#gp2_time').val();
    var description = $('#gp2_description').val();
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 12, token: token, plan_date: date, plan_text: description, sno_project: sno_project },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                clear_activity();
                show_activity_table();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
})

function clear_activity() {
    $('#gp2_time').val("");
    $('#gp2_description').val("");
}


$('#activity_edit tbody').on('click', 'input[name="gp2_checkbox"]', function (e) {
    var table = $('#activity_edit').DataTable();
    var $row = $(this).closest('tr');
    if (this.checked) {
        $row.addClass('selected');
    }
    else {
        $row.removeClass('selected');
    }
    gp2_updateDataTableSelectAllCtrl(table);
});

$("#gp2_CheckAll").click(function () {
    var table = $('#activity_edit').DataTable();
    if ($("#gp2_CheckAll").prop("checked")) {
        $("input[name='gp2_checkbox']").each(function () {
            $(this).prop("checked", true);
            $(this).closest('tr').addClass('selected');
        })
    }
    else {
        $("input[name='gp2_checkbox']").each(function () {
            $(this).prop("checked", false);
            $(this).closest('tr').removeClass('selected');
        })
    }
});

function gp2_updateDataTableSelectAllCtrl(table) {
    var $table = table.table().node();
    var $chkbox_all = $('tbody input[name="gp2_checkbox"]', $table);
    var $chkbox_checked = $('tbody input[name="gp2_checkbox"]:checked', $table);
    var chkbox_select_all = $('thead input[id="gp2_CheckAll"]', $table).get(0);
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

$("#gp2_btndelete").click(function (e) {
    var delete_bool = confirm("確定要刪除資料嗎?");
    if (delete_bool == true) {
        var table = $('#activity_edit').DataTable();
        var Data = table.rows('.selected').data();
        var id = [];
        for (var i = 0; i < Data.length; i++) {
            id.push(Data[i][0]);
        }
        $.ajax({
            type: "POST",
            url: "phpMod/group_apply.php",
            async: false,
            dataType: "json",
            data: { method: 13, token: token, sno_plan: id },
            success: function (data) {
                if (!checkMsg(data.msg)) {
                    delete_all_cookie();
                }
                if (checkMsg(data.msg)) {
                    show_activity_table();
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
            }
        });
    }
});

$("#gp2_nextbtn").click(function () {
    var sno_project = GetCookie("group_id");
    //var project_purpose = ckeditor1.document.getBody().getText();//取得純文字
    if (ckeditor1.document.getBody().getText().trim() == "") {
        alert("請輸入成立理念與宗旨");
        eval("ckeditor1.document.getBody().focus()");
        return false;
    }
    if (ckeditor2.document.getBody().getText().trim() == "") {
        alert("請輸入預期目標與結果");
        eval("ckeditor2.document.getBody().focus()");
        return false;
    }
    if (ckeditor4.document.getBody().getText().trim() == "") {
        alert("請輸入社群發展總體成效");
        eval("ckeditor4.document.getBody().focus()");
        return false;
    }
    var project_purpose = ckeditor1.document.getBody().getHtml();//取得html文本
    var project_predicted = ckeditor2.document.getBody().getHtml();
    var project_result = ckeditor4.document.getBody().getHtml();
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false,
        dataType: "json",
        data: {
            method: 11, token: token, sno_project: sno_project, project_d1: project_purpose,
            project_d2: project_predicted, project_d4: project_result
        },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                document.location.href = "group_apply3.html";
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
})

$("#gp2_prebtn").click(function () {
    document.location.href = "group_apply1.html";
})

//---------------group_apply3.html---------------
function group_apply_3_init() {
    $("#money_table").DataTable({
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
    showMoneyItem();
    show_money_table();
}

function showMoneyItem() {
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false,
        dataType: "json",
        data: { method: 15, token: token, year: GetCookie("year") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                var funding_option = "<option value='0'>請選擇</option>";
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    var sno_funding = data_array['sno_funding'];
                    var funding_name = data_array['funding_name'];
                    funding_option = funding_option + '<option value=' + sno_funding + '>' + funding_name + '</option>';
                }
                $("#gp3_item").html(funding_option);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

function show_money_table() {
    $('#money_table').dataTable().fnClearTable();
    var table = $('#money_table').DataTable();
    var sno_project = GetCookie("group_id");
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false,
        dataType: "json",
        data: { method: 16, token: token, sno_project: sno_project },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    var sno_money = data_array['sno_money'];
                    var funding_name = data_array['funding_name'];
                    var money_price = data_array['money_price'];
                    var money_count = data_array['money_count'];
                    var money_description = data_array['money_description'];
                    table.row.add([
                        sno_money,
                        "<input type='checkbox' id='" + sno_money + "' name='gp3_checkbox' />",
                        funding_name,
                        money_price,
                        money_count,
                        money_price * money_count,
                        money_description
                    ]).draw();
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$("#gp3_btnadd").click(function () {
    var sno_project = GetCookie("group_id");
    if ($("#gp3_item").val() == 0) {
        alert("請選擇經費項目");
        eval("document.getElementById('gp3_item').focus()");
        return false;
    }
    if ($("#gp3_cost").val() == 0) {
        alert("請輸入單價");
        eval("document.getElementById('gp3_cost').focus()");
        return false;
    }
    if ($("#gp3_num").val() == 0) {
        alert("請輸入數量");
        eval("document.getElementById('gp3_num').focus()");
        return false;
    }
    var sno_funding = $('#gp3_item').val();
    var money_price = $('#gp3_cost').val();
    var money_count = $('#gp3_num').val();
    var money_description = $('#gp3_description').val();
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false, ///非同步執行
        dataType: "json",
        data: {
            method: 17, token: token, sno_funding: sno_funding, sno_project: sno_project,
            money_price: money_price, money_count: money_count, money_description: money_description
        },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                clear_money();
                show_money_table();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
})

function clear_money() {
    $('#gp3_item').val("0");
    $('#gp3_cost').val("");
    $('#gp3_num').val("");
    $('#gp3_description').val("");
}


$('#money_table tbody').on('click', 'input[name="gp3_checkbox"]', function (e) {
    var table = $('#money_table').DataTable();
    var $row = $(this).closest('tr');
    if (this.checked) {
        $row.addClass('selected');
    }
    else {
        $row.removeClass('selected');
    }
    gp3_updateDataTableSelectAllCtrl(table);
});

$("#gp3_CheckAll").click(function () {
    var table = $('#money_table').DataTable();
    if ($("#gp3_CheckAll").prop("checked")) {
        $("input[name='gp3_checkbox']").each(function () {
            $(this).prop("checked", true);
            $(this).closest('tr').addClass('selected');
        })
    }
    else {
        $("input[name='gp3_checkbox']").each(function () {
            $(this).prop("checked", false);
            $(this).closest('tr').removeClass('selected');
        })
    }
});

function gp3_updateDataTableSelectAllCtrl(table) {
    var $table = table.table().node();
    var $chkbox_all = $('tbody input[name="gp3_checkbox"]', $table);
    var $chkbox_checked = $('tbody input[name="gp3_checkbox"]:checked', $table);
    var chkbox_select_all = $('thead input[id="gp3_CheckAll"]', $table).get(0);
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

$("#gp3_btndelete").click(function (e) {
    var delete_bool = confirm("確定要刪除資料嗎?");
    if (delete_bool == true) {
        var table = $('#money_table').DataTable();
        var Data = table.rows('.selected').data();
        var id = [];
        for (var i = 0; i < Data.length; i++) {
            id.push(Data[i][0]);
        }
        $.ajax({
            type: "POST",
            url: "phpMod/group_apply.php",
            async: false,
            dataType: "json",
            data: { method: 18, token: token, sno_money: id },
            success: function (data) {
                if (!checkMsg(data.msg)) {
                    delete_all_cookie();
                }
                if (checkMsg(data.msg)) {
                    show_money_table();
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
            }
        });
    }
});

$("#gp3_prebtn").click(function () {
    document.location.href = "group_apply2.html";
})

$("#gp3_savebtn").click(function () {
    document.location.href = "group_edit.html";
})
//---------------group_info1.html---------------
function group_info_1_init() {
    $("#info1_member_table").DataTable({
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
        data: { method: 21, token: token, sno_project: GetCookie("group_id") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                document.getElementById("apply_year").innerHTML = data.out["created_at"].split("-")[0] - 1911 + " 年 ";
                $("#gname").val(data.out["project_name"]);
                $("#timestart").val(data.out["project_time"].split(",")[0]);
                $("#timeend").val(data.out["project_time"].split(",")[1]);
                if (data.out["project_type"] == 1 || data.out["project_type"] == 2 || data.out["project_type"] == 3)
                    $("input[name='group_class']").get(data.out["project_type"] - 1).checked = true;
                else {
                    $("input[name='group_class']").get(3).checked = true;
                    $("#group_class_others").val(data.out["project_type"]);
                }
                $("#leader_name").val(data.out["name"]);
                $("#leader_email").val(data.out["email"]);
                $("#leader_academic").val(data.out["institute"]);
                $("#leader_department").val(data.out["department"]);
                $("#leader_title").val(data.out["title"]);
                $("#leader_office").val(data.out["office"]);
                $("#leader_phone").val(data.out["phone"]);
                $("#ga_aca").val(data.out["assistant_institute"]);
                $("#ga_department").val(data.out["assistant_department"]);
                $("#ga_name").val(data.out["assistant"]);
                $("#ga_email").val(data.out["assistant_email"]);
                $("#ga_tel").val(data.out["assistant_phone"]);
                $("#ga_works").val(data.out["assistant_desc"]);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });

    $('#info1_member_table').dataTable().fnClearTable();
    var table = $('#info1_member_table').DataTable();
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false,
        dataType: "json",
        data: { method: 9, token: token, sno_project: GetCookie("group_id") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    var sno_member = data_array['sno_member'];
                    var name = data_array['name'];
                    var email = data_array['email'];
                    var institute = data_array['institute'];
                    var department = data_array['department'];
                    var title = data_array['title'];
                    var office = data_array['office'];
                    var phone = data_array['phone'];
                    table.row.add([
                        sno_member,
                        name,
                        institute + department,
                        title,
                        "辦公室:" + office + "<br>手機：" + phone,
                        email
                    ]).draw();
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$("#gi1_nextbtn").click(function () {
    document.location.href = "group_info2.html";
})

//---------------group_info2.html---------------
function group_info_2_init() {
    ckeditor1 = CKEDITOR.replace('purpose');
    ckeditor2 = CKEDITOR.replace('predicted');
    ckeditor4 = CKEDITOR.replace('result');
    $("#info2_activity_edit").DataTable({
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
        data: { method: 20, token: token, sno_project: GetCookie("group_id") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                if (data.out["project_d1"] != "")
                    CKEDITOR.instances.purpose.setData(data.out["project_d1"]);
                if (data.out["project_d2"] != "")
                    CKEDITOR.instances.predicted.setData(data.out["project_d2"]);
                if (data.out["project_d4"] != "")
                    CKEDITOR.instances.result.setData(data.out["project_d4"]);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });

    $('#info2_activity_edit').dataTable().fnClearTable();
    var table = $('#info2_activity_edit').DataTable();
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false,
        dataType: "json",
        data: { method: 14, token: token, sno_project: GetCookie("group_id") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    var sno_plan = data_array['sno_plan'];
                    var plan_date = data_array['plan_date'];
                    var plan_text = data_array['plan_text'];
                    table.row.add([
                        sno_plan,
                        plan_date,
                        plan_text
                    ]).draw();
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$("#gi2_nextbtn").click(function () {
    document.location.href = "group_info3.html";
})

$("#gi2_prebtn").click(function () {
    document.location.href = "group_info1.html";
})

//---------------group_info3.html---------------
function group_info_3_init() {
    $("#info3_money_table").DataTable({
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

    $('#info3_money_table').dataTable().fnClearTable();
    var table = $('#info3_money_table').DataTable();
    $.ajax({
        type: "POST",
        url: "phpMod/group_apply.php",
        async: false,
        dataType: "json",
        data: { method: 16, token: token, sno_project: GetCookie("group_id") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                for (var i = 0; i < data.out.length; i++) {
                    var data_array = data.out[i];
                    var sno_money = data_array['sno_money'];
                    var funding_name = data_array['funding_name'];
                    var money_price = data_array['money_price'];
                    var money_count = data_array['money_count'];
                    var money_description = data_array['money_description'];
                    table.row.add([
                        sno_money,
                        funding_name,
                        money_price,
                        money_count,
                        money_price * money_count,
                        money_description
                    ]).draw();
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$("#gi3_savebtn").click(function () {
    document.location.href = "group_edit.html";
})

$("#gi3_prebtn").click(function () {
    document.location.href = "group_info2.html";
})
