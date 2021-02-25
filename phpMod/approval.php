<?php
header('Content-Type: application/json; charset=UTF-8');
include("fig.php");
@$token = $_POST["token"];
@$sno_project = $_POST["sno_project"];
@$project_approval = $_POST["project_approval"];

$db=new database;//資料庫
$gtoken=new get_token;//token
$gemail=new email_data;//email
$gtoken->token_check($token);//檢查token


switch ($method) {
	//審核通過
	case 0:
		//更新審核狀態
		$result=$db->query("UPDATE `project` SET `project_approval` = '".$project_approval."' WHERE `project`.`sno_project` = '".$sno_project."';");
		
		//取得召集人，助理
		$result=$db->query("SELECT `sno_member`, `assistant`,`project_name` FROM `project` WHERE `sno_project` = '".$sno_project."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
			
			
		if($project_approval==1)
			$message_content="審核通過";
		else
			$message_content="審核未通過";
		
		//寄給招集人
		//站內信
		$resultt=$db->query("INSERT INTO `message` ( `message_content`, `message_sender`, `message_recipient`, `sno_project`,`message_header`) 
		VALUES ( '".$message_content."', '".$gtoken->get_sno_member($token)."','".$row['sno_member']."', '".$sno_project."', '".$row['project_name']."')");
		//取得email
		$resultt=$db->query("SELECT `sno_member`,`name`, `email` FROM `member` WHERE `sno_member` = '".$row['sno_member']."';");
		$roww = $resultt->fetch_array(MYSQLI_ASSOC);
		//email寄信
		$gemail->send_email($roww['email'],$row['project_name'],$message_content);
		
		//寄給助理
		//站內信
		$resultt=$db->query("INSERT INTO `message` ( `message_content`, `message_sender`, `message_recipient`, `sno_project`,`message_header`) 
		VALUES ( '".$message_content."', '".$gtoken->get_sno_member($token)."','".$row['assistant']."', '".$sno_project."', '".$row['project_name']."')");
		//取得email
		$resultt=$db->query("SELECT `sno_member`,`name`, `email` FROM `member` WHERE `sno_member` = '".$row['assistant']."';");
		$roww = $resultt->fetch_array(MYSQLI_ASSOC);
		//email寄信
		$gemail->send_email($roww['email'],$row['project_name'],$message_content);
		
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
        break;

}
echo json_encode(array(
	'msg' =>'209'
));
