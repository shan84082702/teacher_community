<?php
header('Content-Type: application/json; charset=UTF-8');
@$token=$_POST["token"]; 
@$page = $_POST["page"];
@$role=$_POST["role"]; 
include('fig.php');
if($page == 1){
$remenu ='<li class="header"></li>
            <li class="active">
                <a href="index.html">
                    <i class="fa  fa-home"></i> <span>首頁</span>
                </a>
            </li>';
}
else{
	$remenu ='<li class="header"></li>
                <li>
                    <a href="index.html">
                        <i class="fa  fa-home"></i> <span>首頁</span>
                    </a>
                </li>';
}
if($page == 2){
    $remenu .='<li class="active">
                    <a href="group_edit.html">
                        <i class="fa  fa-users"></i> <span>社群計畫管理</span>
                    </a>
                </li>';
}
else{
    $remenu .='<li>
                    <a href="group_edit.html">
                        <i class="fa  fa-users"></i> <span>社群計畫管理</span>
                    </a>
                </li>';
}
if($page == 3){
    $remenu .='<li class="active">
                    <a href="activity_edit.html">
                        <i class="fa  fa-photo"></i> <span>活動管理</span>
                    </a>
                </li>';
}
else{
    $remenu .='<li>
                    <a href="activity_edit.html">
                        <i class="fa  fa-photo"></i> <span>活動管理</span>
                    </a>
                </li>';
}
if($page == 4){
    $remenu .='<li class="active">
                    <a href="funding.html">
                        <i class="fa  fa-photo"></i> <span>經費項目管理</span>
                    </a>
                </li>';
}
else{
    $remenu .='<li>
                    <a href="funding.html">
                        <i class="fa  fa-photo"></i> <span>經費項目管理</span>
                    </a>
                </li>';
}
if($role=="管理員"){
    if($page == 5){
        $remenu .='<li class="active">
                    <a href="account.html">
                        <i class="fa  fa-photo"></i> <span>人員管理</span>
                    </a>
                </li>';
    }
    else{
        $remenu .='<li>
                    <a href="account.html">
                        <i class="fa  fa-photo"></i> <span>人員管理</span>
                    </a>
                </li>';
    }
    if($page == 6){
        $remenu .='<li class="active">
                    <a href="review.html">
                        <i class="fa  fa-photo"></i> <span>社群計畫審核</span>
                    </a>
                </li>';
    }
    else{
        $remenu .='<li>
                    <a href="review.html">
                        <i class="fa  fa-photo"></i> <span>社群計畫審核</span>
                    </a>
                </li>';
    }
}
$arr['msg'] = '200';
$arr['remenu'] = $remenu;
echo json_encode($arr,JSON_UNESCAPED_UNICODE);

?>