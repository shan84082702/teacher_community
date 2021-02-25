<?php
header('Content-Type: application/json; charset=UTF-8'); 
include("fig.php");
@$token = $_POST["token"];
@$method = $_POST["method"];
@$sno_member_s = $_POST["sno_member_s"];
@$sno_project = $_POST["sno_project"];
@$message_content = $_POST["message_content"];
@$message_header = $_POST["message_header"];
@$sno_message = $_POST["sno_message"];

$db=new database;//資料庫
$gtoken=new get_token;//token
$gemail=new email_data;//email

/*
$sno_member_s=array();
array_push($sno_member_s,6);
array_push($sno_member_s,7);*/

$out=array();//輸出陣列
switch ($method) {
	//寄信
	case 0:
		$array_number=count($sno_member_s);//陣列數量
		for($i=0;$i<$array_number;$i++){
			//取得人員email
			$result=$db->query("SELECT `sno_member`,`name`, `email`, `subject_department`.`department`, `subject_institute`.`institute`, `title`, `office`, `phone`
			FROM `member`, `subject_department`, `subject_institute` WHERE  `subject_department`.`sno_department` = `member`.`sno_subject`
			AND `subject_institute`.`sno_institute`=`subject_department`.`sno_institute` AND `sno_member` = '".$sno_member_s[$i]."';");
			$row = $result->fetch_array(MYSQLI_ASSOC);
			//站內信
			$result=$db->query("INSERT INTO `message` ( `message_content`, `message_sender`, `message_recipient`, `sno_project`,`message_header`) 
			VALUES ( '".$message_content."', '".$gtoken->get_sno_member($token)."','".$sno_member_s[$i]."', '".$sno_project."', '".$message_header."')");
			
			//email寄信
			$gemail->send_email($row['email'],$message_header,$message_content);
		
		}
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//列出社群
	case 1:
		$result=$db->query("SELECT DISTINCT `attend`.`sno_project`, `project`.`project_name` FROM `attend` LEFT JOIN `project` ON `project`.`sno_project` = `attend`.`sno_project` 
		WHERE `attend`.`sno_member` ='".$gtoken->get_sno_member($token)."'");
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_project']=$row['sno_project'];
			$out1['project_name']=$row['project_name'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out' =>$out
		));
		exit;
		break;
	//選完社群，列出人員
	case 2:
		$result=$db->query("SELECT `attend`.`sno_member`, `subject_department`.`department`, `subject_institute`.`institute`, `member`.`name`, `member`.`title`, `member`.`office`, `member`.`phone`, `member`.`email` 
		FROM `attend` LEFT JOIN `member` ON `member`.`sno_member` = `attend`.`sno_member` LEFT JOIN `subject_department` ON `subject_department`.`sno_department` = `member`.`sno_subject` LEFT JOIN `subject_institute` 
		ON `subject_institute`.`sno_institute` = `subject_department`.`sno_institute` WHERE `attend`.`sno_project` = '".$sno_project."'");
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_member']=$row['sno_member'];
			$out1['department']=$row['department'];
			$out1['institute']=$row['institute'];
			$out1['name']=$row['name'];
			$out1['title']=$row['title'];
			$out1['office']=$row['office'];
			$out1['phone']=$row['phone'];
			$out1['email']=$row['email'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out' =>$out
		));
		exit;
		break;
	//列出信件
	case 3:
		$result=$db->query("SELECT `message`.`sno_message`, `member`.`name`, `message`.`created_at`, `project`.`project_name`, `project`.`sno_project` FROM `message` LEFT JOIN `project` ON `project`.`sno_project` = `message`.`sno_project` 
		left join `member` on `member`.`sno_member` = `message`.`message_sender` WHERE `message`.`message_recipient` = '".$gtoken->get_sno_member($token)."'");
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_message']=$row['sno_message'];
			$out1['name']=$row['name'];
			$out1['created_at']=$row['created_at'];
			$out1['sno_project']=$row['sno_project'];
			$out1['project_name']=$row['project_name'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out' =>$out
		));
		
		exit;
		break;
	//列出單一信件
	case 4:
		$result=$db->query("SELECT `message`.`sno_message`, `message`.`message_sender`, `member`.`name`,`member`.`email`, `message`.`message_content`,`message`.`message_header`, `message`.`sno_project`, `message`.`created_at`, `project`.`project_name` FROM `message` LEFT JOIN `project` ON `project`.`sno_project` = `message`.`sno_project` 
		left join `member` on `member`.`sno_member` = `message`.`message_sender` WHERE `message`.`sno_message` = '".$sno_message."'");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		$out['sno_message']=$row['sno_message'];
		$out['message_sender']=$row['message_sender'];
		$out['name']=$row['name'];
		$out['email']=$row['email'];
		$out['message_header']=$row['message_header'];
		$out['message_content']=$row['message_content'];
		$out['created_at']=$row['created_at'];
		$out['sno_project']=$row['sno_project'];
		$out['project_name']=$row['project_name'];
		echo json_encode(array(
			'msg' =>'200',
			'out' =>$out
		));
		
		exit;
		break;
	//取得收件人資料
	case 5:
		$array_number=count($sno_member_s);//陣列數量
		for($i=0;$i<$array_number;$i++){
			//取得人員email
			$result=$db->query("SELECT `sno_member`,`name`, `email` FROM `member` WHERE `sno_member` = '".$sno_member_s[$i]."';");
			$row = $result->fetch_array(MYSQLI_ASSOC);
			$out1['name']=$row['name'];
			$out1['email']=$row['email'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out' =>$out
		));
		exit;
		break;
}
echo json_encode(array(
	'msg' =>'209'
));