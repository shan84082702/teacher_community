var token = GetCookie("token");
var domain = window.location.hostname;
//---------------review.html---------------
function review_init() {
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
    //取得成果報告列表資料
    get_grouplist();
}

//選取年份變更→成果報告列表變更
$("#year").change(function () {
    get_grouplist();
});


$("#report_table tbody").on("click", "a#detail", function () {
    var table = $("#report_table").DataTable();
    var data = table.row($(this).parents("tr")).data();
    SetCookie("group_id", data[0], 1, domain);
    SetCookie("year", $("#year").val(), 1, domain);
    document.location.href = "review_info1.html";
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
                    t.row.add([
                        group_id,
                        group_name,
                        update_at,
                        group_time.split(",")[0] + "<br/>至<br/>" + group_time.split(",")[1],
                        group_status,
                        group_approval,
                        "<a style='margin-top:5%' class='btn bg-olive btn-xs' id='detail'>詳細資料</a>"
                    ]).draw(false);
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

//---------------review_info1.html---------------
function review_info_1_init() {
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

$("#ri1_nextbtn").click(function () {
    document.location.href = "review_info2.html";
})

//---------------review_info2.html---------------
function review_info_2_init() {
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

$("#ri2_nextbtn").click(function () {
    document.location.href = "review_info3.html";
})

$("#ri2_prebtn").click(function () {
    document.location.href = "review_info1.html";
})

//---------------review_info3.html---------------
function review_info_3_init() {
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

$("#ri3_pass").click(function () {
    $.ajax({
        type: "POST",
        url: "phpMod/approval.php",
        async: false,
        dataType: "json",
        data: { method: 0, token: token, sno_project: GetCookie("group_id"),project_approval:1 },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                alert("審核通過");
                document.location.href = "review.html";
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
})

$("#ri3_notpass").click(function () {
    $.ajax({
        type: "POST",
        url: "phpMod/approval.php",
        async: false,
        dataType: "json",
        data: { method: 0, token: token, sno_project: GetCookie("group_id"),project_approval:0 },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                alert("審核未通過");
                document.location.href = "review.html";
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
})

$("#ri3_prebtn").click(function () {
    document.location.href = "review_info2.html";
})
