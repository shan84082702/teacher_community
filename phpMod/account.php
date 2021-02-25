<?php
header('Content-Type: application/json; charset=UTF-8'); 
include("fig.php");
@$token = $_POST["token"];
@$method = $_POST["method"];
@$account = $_POST["account"];
@$name = $_POST["name"];
@$password = $_POST["password"];
@$email = $_POST["email"];
@$sno_role = $_POST["sno_role"];
@$sno_subject = $_POST["sno_subject"];
$db=new database;//資料庫
$gtoken=new get_token;//token

switch ($method) {
	//新增帳號
	case 0:
		//檢查是否重複
		$result=$db->query("SELECT count(`account`) AS 'exist' FROM `member` WHERE `account` = '".$account."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		//沒有重複後新增
		if($row['exist']==0){
			$result=$db->query("INSERT INTO `member`(`account`, `name`, `password`, `email`, `sno_role`, `sno_subject`) 
			VALUES ('".$account."','".$name."','".$password."','".$email."','".$sno_role."','".$sno_subject."');");
			echo json_encode(array(
				'msg' =>'200'
			));
		}
		//帳號重複
		else{
			echo json_encode(array(
				'msg' =>'207'
			));
			exit;
		}
		exit;
		break;
	//登入
	case 1:
		//檢查帳密
		$result=$db->query("SELECT (CASE COUNT(*) WHEN 0 THEN -1 ELSE `sno_member` END) AS `sno_member` FROM `member` WHERE `account` = '".$account."' AND `password` = '".$password."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		//帳號存在，寫入token
		if($row['sno_member']!=-1){
			$encode_token['sno_member'] = $row['sno_member'];
            $encode_token['now_time'] = date("ymdHis");
			$tokenin = json_encode($encode_token); //token用json包起來
			$tokenin=$gtoken->encrypt($tokenin);
			$result=$db->query("UPDATE `member` SET `token`= '".$tokenin."' WHERE `account` = '".$account."';");
			//人員名稱，稱謂
			$result=$db->query("SELECT `sno_member`, `name`, `email`, `title`, `role`.`sno_role`, `role`.`role_name` FROM `member` LEFT JOIN `role` ON `role`.`sno_role` = `member`.`sno_role` WHERE `sno_member` = '".$encode_token['sno_member']."';");
			$row = $result->fetch_array(MYSQLI_ASSOC);
            $signin_id=$row['sno_member'];
            $signin_name=$row['name'];
			$signin_title=$row['title'];	
			$signin_sno_role=$row['sno_role'];
			$signin_role_name=$row['role_name'];
			echo json_encode(array(
				'msg' =>'200',
                'token'=>$tokenin,
                'id'=>$signin_id,
				'name'=>$signin_name,
				'title'=>$signin_title,
				'sno_role'=>$signin_sno_role,
				'role_name'=>$signin_role_name
			));
			exit;
		}
		//帳號不存在
		else{
			echo json_encode(array(
				'msg' =>'208'
			));
			exit;
		}
		break;
	//修改密碼
	case 2:
		$gtoken->token_check($token);//檢查token
		$sno_member=$gtoken->get_sno_member($token);
		$result=$db->query("UPDATE `member` SET `password` = '".$password."' WHERE `member`.`sno_member` = '".$sno_member."';");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//登出
	case 3:
		$gtoken->token_check($token);//檢查token
		$sno_member=$gtoken->get_sno_member($token);
		$result=$db->query(" UPDATE `member` SET `token`= '' WHERE `sno_member` = '".$sno_member."';");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
}
echo json_encode(array(
	'msg' =>'209'
));