var token = GetCookie("token");
var domain = window.location.hostname;
//---------------report1.html---------------
function report_1_init() {
    $("#report1_table").DataTable({
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
    show_report1_info();
}

function show_report1_info() {
    $('#report1_table').dataTable().fnClearTable();
    var table = $('#report1_table').DataTable();
    $.ajax({
        type: "POST",
        url: "phpMod/group_report.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 1, token: token, sno_project: GetCookie("group_id") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                $("#gname").val(data.out["project_name"]);
                document.getElementById("apply_year").innerHTML = data.out["created_at"].split("-")[0] - 1911 + " 年 ";
                $("#timestart").val(data.out["project_time"].split(",")[0]);
                $("#timeend").val(data.out["project_time"].split(",")[1]);
                $("input[name='group_class']").get(data.out["project_type"] - 1).checked = true;
                if (data.out["report_seniority"] == 0)
                    $("input[name='group_year_class']").get(0).checked = true;
                else {
                    $("input[name='group_year_class']").get(1).checked = true;
                    $("#old_year").val(data.out["report_seniority"]);
                }
                $("#leader_name").val(data.out["name"]);
                $("#leader_academic").val(data.out["institute"]);
                $("#leader_department").val(data.out["department"]);
                $("#leader_title").val(data.out["title"]);
                for (var i = 0; i < data.out["member_list"].length; i++) {
                    var data_array = data.out["member_list"][i];
                    table.row.add([
                        data_array['sno_attend'],
                        data_array['name'],
                        data_array['title'],
                        data_array['institute'] + data_array['department'],
                        "<input type='text' id='attend_year" + data_array['sno_attend'] + "' value='" + data_array['attend_hour'] + "' style='width:20%;'/>" + " 小時"
                    ]).draw();
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$("#report1_next").click(function () {
    if ($("input[name='group_year_class']:checked").length == 0) {
        alert("請選擇社群年資");
        eval("document.getElementById('group_year_class').focus()");
        return false;
    }
    var report_seniority = "";
    if ($("input[name='group_year_class']:checked").val() == "1")
        report_seniority = 0;
    else
        report_seniority = $("#old_year").val();
    var table = $('#report1_table').DataTable();
    var sno_attend = [];
    var hours = [];
    var data = table.rows().data();
    for (var i = 0; i < data.length; i++) {
        if ($('#attend_year' + data[i][0]).val() == "") {
            alert("請輸入研習時數");
            eval("document.getElementById('attend_year" + data[i][0] + "').focus()");
            return false;
        }
        else {
            sno_attend.push(data[i][0]);
            hours.push($('#attend_year' + data[i][0]).val());
        }
    }

    $.ajax({
        type: "POST",
        url: "phpMod/group_report.php",
        async: false, ///非同步執行
        dataType: "json",
        data: {
            method: 3, token: token, sno_project: GetCookie("group_id"),
            report_seniority: report_seniority, hours: hours, sno_attend: sno_attend
        },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                document.location.href = "report2.html";
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
    document.location.href = "report2.html";
})


//---------------report2.html---------------
var img_delete_id = [];
var img_insert_des = [];
var img_update_id = [];
var img_update_des = [];
var plus_index = 1;
$(document).on("click", ".plus_btn_img", function (event) {
    $(this)
        .parents(".act_edit")
        .after(
            '<div class="row act_edit_plus" style="width: 80%;margin-left: 3.5%;margin-top: 1%;">\
                <input accept = "image/*" id = "upload-pic'+plus_index+'" name = "act_img'+plus_index+'" style = "display: inline" type = "file" />\
                <span>圖片說明 : </span>\
                <input type="text" name="img_des" style="width:30%" />\
                <input type="text" name="img_id" style="width:10%;display:none;" />\
                <button class="button hollow circle row_plus_btn_img" data-field="quantity"\
                    data-quantity="plus" type="button" style="margin-left: 0.5%;">\
                <i aria-hidden="true" class="fa fa-plus"></i></button>\
                <button type="button" class="button hollow circle minus_btn" data-quantity="minus" \
			        data-field="quantity" style="margin-left:0.5%;">\
                <i class="fa fa-minus" aria-hidden="true"></i></button></div>'
        );
    plus_index++;
});
$(document).on("click", ".row_plus_btn_img", function (event) {
    $(this)
        .parents(".act_edit_plus")
        .after(
            '<div class="row act_edit_plus" style="width: 80%;margin-left: 3.5%;margin-top: 1%;">\
                <input accept = "image/*" id = "upload-pic'+plus_index+'" name = "act_img'+plus_index+'" style = "display: inline" type = "file" />\
                <span>圖片說明 : </span>\
                <input type="text" name="img_des" style="width:30%" />\
                <input type="text" name="img_id" style="width:10%;display:none;" />\
                <button class="button hollow circle row_plus_btn_img" data-field="quantity"\
                    data-quantity="plus" type="button" style="margin-left: 0.5%;">\
                <i aria-hidden="true" class="fa fa-plus"></i></button>\
                <button type="button" class="button hollow circle minus_btn" data-quantity="minus" \
			        data-field="quantity" style="margin-left:0.5%;">\
                <i class="fa fa-minus" aria-hidden="true"></i></button></div>'
        );
    plus_index++;
});
$(document).on("click", ".minus_btn", function (event) {
    var delete_id = $(this).parents(".act_edit_plus").children().next().next().next().val();
    if (delete_id != "") {
        img_delete_id.push(delete_id);
    }
    $(this).parents(".act_edit_plus").remove();
});

var ckeditor1;
var ckeditor2;
var ckeditor3;
var ckeditor4;
var ckeditor5;
function report_2_init() {
    ckeditor1 = CKEDITOR.replace('special');
    ckeditor2 = CKEDITOR.replace('activity_explain');
    ckeditor3 = CKEDITOR.replace('activity_plan');
    ckeditor4 = CKEDITOR.replace('review');
    ckeditor5 = CKEDITOR.replace('discuss');
    show_report2_info();
}

function show_report2_info() {
    $.ajax({
        type: "POST",
        url: "phpMod/group_report.php",
        async: false, ///非同步執行
        dataType: "json",
        data: { method: 2, token: token, sno_project: GetCookie("group_id") },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                if (data.out["report_d1"] != "")
                    CKEDITOR.instances.special.setData(data.out["report_d1"]);
                if (data.out["report_d2"] != "")
                    CKEDITOR.instances.activity_explain.setData(data.out["report_d2"]);
                if (data.out["report_d3"] != "")
                    CKEDITOR.instances.activity_plan.setData(data.out["report_d3"]);
                if (data.out["report_d4"] != "")
                    CKEDITOR.instances.review.setData(data.out["report_d4"]);
                if (data.out["report_d5"] != "")
                    CKEDITOR.instances.discuss.setData(data.out["report_d5"]);
                var img_arr_length = data.out['file'].length;
                console.log(img_arr_length);
                if (img_arr_length > 0) {
                    for (var j = 0; j < img_arr_length; j++) {
                        $(".act_edit")
                            .after(
                                '<div class="row act_edit_plus" style="width: 80%;margin-left: 3.5%;margin-top: 1%;">\
                                <img class="img_src" width="30%">\
                                <span>圖片說明 : </span>\
                                <input type="text" name="img_des" style="width:30%" />\
                                <input type="text" name="img_id" style="width:10%;display:none;" />\
                                <button class="button hollow circle row_plus_btn_img" data-field="quantity"\
                                    data-quantity="plus" type="button" style="margin-left: 0.5%;">\
                                <i aria-hidden="true" class="fa fa-plus"></i></button>\
                                <button type="button" class="button hollow circle minus_btn" data-quantity="minus" \
			                        data-field="quantity" style="margin-left:0.5%;">\
                                <i class="fa fa-minus" aria-hidden="true"></i></button></div>'
                            );
                        }
                    }
                for (var j = 0; j < img_arr_length; j++) {
                    $('.act_edit_plus').eq(j).children().next().next().val(data.out['file'][j]['file_description']);
                    $('.act_edit_plus').eq(j).children().next().next().next().val(data.out['file'][j]['sno_file']);
                }
                $(".img_src").each(function(index) {
                    $(this).attr("src", data.out['file'][index]['file_path']);
                });
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });
}

$("#report2_pre").click(function () {
    document.location.href = "report1.html";
})

$("#report2_next").click(function () {
    var report_d1 = ckeditor1.document.getBody().getHtml();//取得html文本
    var report_d2 = ckeditor2.document.getBody().getHtml();
    var report_d3 = ckeditor3.document.getBody().getHtml();
    var report_d4 = ckeditor4.document.getBody().getHtml();
    var report_d5 = ckeditor5.document.getBody().getHtml();
    $.ajax({
        type: "POST",
        url: "phpMod/group_report.php",
        async: false, ///非同步執行
        dataType: "json",
        data: {
            method: 4, token: token, sno_project: GetCookie("group_id"),
            report_d1: report_d1, report_d2: report_d2, report_d3: report_d3,
            report_d4: report_d4, report_d5: report_d5
        },
        success: function (data) {
            if (!checkMsg(data.msg)) {
                delete_all_cookie();
            }
            if (checkMsg(data.msg)) {
                uploadphoto();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
        }
    });

})

function uploadphoto() {
    var img_plus_num = $('.act_edit_plus').length;
    for (var i = 0; i < img_plus_num; i++) {
        var update_id = $('.act_edit_plus').eq(i).children().next().next().next().val();
        if (update_id == "") {
            img_insert_des.push($('.act_edit_plus').eq(i).children().next().next().val());
        }
        else {
            img_update_id.push($('.act_edit_plus').eq(i).children().next().next().next().val());
            img_update_des.push($('.act_edit_plus').eq(i).children().next().next().val());
        }
    }
    var img_insert_des_json = JSON.stringify(img_insert_des);
    var img_update_des_json = JSON.stringify(img_update_des);
    var img_delete_id_json = JSON.stringify(img_delete_id);
    var img_update_id_json = JSON.stringify(img_update_id);
    console.log("新增:"+img_insert_des);
    console.log("刪除ID:"+img_delete_id);
    console.log("修改ID:"+img_update_id);
    console.log("修改:"+img_update_des);
    var form = document.forms.namedItem("fileinfo");
    form.addEventListener(
        "submit",
        function (ev) {
            oData = new FormData(form);
            oData.append("insert_des", img_insert_des_json);
            oData.append("method", 5);
            oData.append("update_file", img_update_id_json);
            oData.append("token", token);
            oData.append("update_des", img_update_des_json);
            oData.append("sno_project", GetCookie("group_id"));
            oData.append("del_file", img_delete_id_json);
            var oReq = new XMLHttpRequest();
            oReq.open("POST", "phpMod/group_report.php", true);
            oReq.onload = function (oEvent) {
                if (oReq.status == 200) {
                    alert("編輯成功");
                    //document.location.href = "result.html";
                }
                else
                    alert("失敗");
            };
            oReq.send(oData);
            ev.preventDefault();
        },
        false
    );
    /*   $.ajax({
           type: "POST",
           url: "phpMod/group_report.php",
           async: false, ///非同步執行
           dataType: "json",
           data: { method: 5, token: token, sno_project: GetCookie("group_id"),
                   del_file, insert_des, update_file, update_des},
           success: function (data) {
               if (!checkMsg(data.msg)) {
                   delete_all_cookie();
               }
               if (checkMsg(data.msg)) {
                   document.location.href = "group_edit.html";
               }
           },
           error: function (XMLHttpRequest, textStatus, errorThrown) {
               alert(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
           }
       });*/
}