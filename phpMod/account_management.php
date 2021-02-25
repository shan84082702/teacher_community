<?php
header('Content-Type: application/json; charset=UTF-8');
include("fig.php");
@$token = $_POST["token"];
@$method = $_POST["method"];
@$account_name = $_POST["account_name"];
@$account_title = $_POST["account_title"];
@$account_department = $_POST["account_department"];
@$account_phone = $_POST["account_phone"];
@$account_cellphone = $_POST["account_cellphone"];
@$account_email = $_POST["account_email"];
@$account_permission = $_POST["account_permission"];
@$sno_member = $_POST["sno_member"];

$db=new database;//資料庫
$gtoken=new get_token;//token
$gtoken->token_check($token);//檢查token

switch ($method) {
	//列出權限
	case 0:
		$result=$db->query("SELECT `sno_role`,`role_name` FROM `role` WHERE 1;");
		$out=array();
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
            $out1['sno_role']=$row['sno_role'];
            $out1['role_name']=$row['role_name'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
        break;
    //列出人員列表
    case 1:
		$result=$db->query("SELECT `sno_member`,`name`, `email`, `subject_department`.`department`, `subject_institute`.`institute`, `title`, `office`, `phone`
		FROM `member`, `subject_department`, `subject_institute` WHERE  `subject_department`.`sno_department` = `member`.`sno_subject`
		AND `subject_institute`.`sno_institute`=`subject_department`.`sno_institute`;");
		$out=array();
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
            $out1['sno_member']=$row['sno_member'];
            $out1['name']=$row['name'];
            $out1['email']=$row['email'];
            $out1['department']=$row['department'];
            $out1['institute']=$row['institute'];
            $out1['title']=$row['title'];
            $out1['office']=$row['office'];
            $out1['phone']=$row['phone'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
        break;
    //新增人員
    case 2:
        $result=$db->query("INSERT INTO `member` SET `name` = '".$account_name."', `title` = '".$account_title."', `sno_subject` = '".$account_department."',
            `office` = '".$account_phone."',`phone` = '".$account_cellphone."',`email` = '".$account_email."',`sno_role` = '".$account_permission."';");
        echo json_encode(array(
            'msg' =>'200'
        ));
        exit;
        break;
    //刪除人員
    case 3:
		$array_number=count($sno_member);//陣列數量
		for($i=0;$i<$array_number;$i++)
			$result=$db->query("DELETE FROM `member` WHERE `sno_member` = '".$sno_member[$i]."';");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
        break;
    //取得某一位人員資料
    case 4:
		$result=$db->query("SELECT `sno_member`,`name`, `email`, `sno_subject`, `subject_institute`.`sno_institute`, `title`, `office`, `phone`, `sno_role`
		FROM `member`, `subject_department`, `subject_institute` WHERE  `subject_department`.`sno_department` = `member`.`sno_subject`
		AND `subject_institute`.`sno_institute`=`subject_department`.`sno_institute` AND `member`.`sno_member` = '".$sno_member."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
        $out['sno_member']=$row['sno_member'];
        $out['name']=$row['name'];
        $out['email']=$row['email'];
        $out['sno_subject']=$row['sno_subject'];
        $out['sno_institute']=$row['sno_institute'];
        $out['title']=$row['title'];
        $out['office']=$row['office'];
        $out['phone']=$row['phone'];
        $out['sno_role']=$row['sno_role'];
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
        break;
    //編輯人員資料
    case 5:
        $result=$db->query("UPDATE `member` SET `name` = '".$account_name."', `title` = '".$account_title."', `sno_subject` = '".$account_department."',
        `office` = '".$account_phone."',`phone` = '".$account_cellphone."',`email` = '".$account_email."',`sno_role` = '".$account_permission."' WHERE `sno_member`='".$sno_member."';");
        echo json_encode(array(
            'msg' =>'200'
        ));
        exit;
        break;
}
echo json_encode(array(
	'msg' =>'209'
));
