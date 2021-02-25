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
@$sno_institute = $_POST["sno_institute"];
@$sno_department = $_POST["sno_department"];
@$sno_member = $_POST["sno_member"];
@$project_name = $_POST["project_name"];
@$project_time = $_POST["project_time"];
@$project_type = $_POST["project_type"];
@$assistant = $_POST["assistant"];
@$assistant_desc = $_POST["assistant_desc"];
@$sno_member_s = $_POST["sno_member_s"];
@$sno_project = $_POST["sno_project"];
@$year = $_POST["year"];
@$project_d1 = $_POST["project_d1"];
@$project_d2 = $_POST["project_d2"];
@$project_d4 = $_POST["project_d4"];
@$plan_date = $_POST["plan_date"];
@$plan_text = $_POST["plan_text"];
@$sno_plan = $_POST["sno_plan"];
@$sno_funding = $_POST["sno_funding"];
@$money_price = $_POST["money_price"];
@$money_count = $_POST["money_count"];
@$money_description = $_POST["money_description"];
@$sno_money = $_POST["sno_money"];
$db=new database;//資料庫
$gtoken=new get_token;//token
$gtoken->token_check($token);//檢查token

switch ($method) {
	//新增空的申請表
	case 0:
		$result=$db->query2("INSERT INTO `project` SET `sno_member` = '".$gtoken->get_sno_member($token)."';
		SELECT LAST_INSERT_ID() as 'sno_project';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		$sno_project=$row['sno_project'];//取得流水號值
		$result=$db->query("INSERT INTO `attend` SET `sno_member` = '".$gtoken->get_sno_member($token)."', `sno_project` ='".$sno_project."';");
		echo json_encode(array(
			'msg' =>'200',
			'sno_project'=>$sno_project
		));
		exit;
		break;
	//列出申請表
	case 1:
		$sno_member=$gtoken->get_sno_member($token);//取得人員流水號
		// $result=$db->query("SELECT `sno_project`, `updated_at`, `project_time`, `project_status`, `project_approval` ,`project_name`
		// FROM `project` WHERE `year` = '".$year."' AND `sno_member` = '".$sno_member."' AND `isDone`='1';");
		$result=$db->query("SELECT DISTINCT `project`.`sno_project`, `project`.`updated_at`, `project`.`project_time`, `project`.`project_status`, `project`.`project_approval`, `project`.`project_name` 
		FROM `project` LEFT JOIN `attend` ON `attend`.`sno_project` = `project`.`sno_project` 
		WHERE `project`.`year` = '".$year."' AND `project`.`isDone` = '1' AND (`attend`.`sno_member` = '".$sno_member."' OR '1' = (SELECT `member`.`sno_role` FROM `member` WHERE `member`.`sno_member` = '".$sno_member."'))");
		$out=array();
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_project']=$row['sno_project'];
			$out1['updated_at']=$row['updated_at'];
			$out1['project_time']=$row['project_time'];
			$out1['project_status']=$row['project_status'];
            $out1['project_approval']=$row['project_approval'];
            $out1['project_name']=$row['project_name'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
        break;
    //刪除申請表
    case 23:
		$array_number=count($sno_project);//陣列數量
		for($i=0;$i<$array_number;$i++)
			$result=$db->query("DELETE FROM `project` WHERE `sno_project` = '".$sno_project[$i]."';");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//修改申請表
	case 2:
		$result=$db->query("UPDATE `project` SET `project_name` = '".$project_name."', `year` = '".$year."', `project_time` = '".$project_time."', `project_type` = '".$project_type."', `assistant` = '".$assistant."',
		`assistant_desc` = '".$assistant_desc."', `isDone` = '1' WHERE `project`.`sno_project` = '".$sno_project."';");
		//$row = $result->fetch_array(MYSQLI_ASSOC);
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//給院名稱
	case 3:
		$result=$db->query("SELECT `sno_institute`, `institute` FROM `subject_institute`;");
		$out=array();
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_institute']=$row['sno_institute'];
			$out1['institute']=$row['institute'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//給系名稱
	case 4:
		$result=$db->query("SELECT `sno_department`, `department` FROM `subject_department` WHERE `sno_institute` = '".$sno_institute."';");
		$out=array();
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_department']=$row['sno_department'];
			$out1['department']=$row['department'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//給名字
	case 5:
		$result=$db->query("SELECT `sno_member`, `name` FROM `member` WHERE `sno_subject` = '".$sno_department."';");
		$out=array();
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_member']=$row['sno_member'];
			$out1['name']=$row['name'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//給人員資料
	case 6:
		$result=$db->query("SELECT `sno_member`,`name`, `email`, `subject_department`.`department`, `subject_institute`.`institute`, `title`, `office`, `phone`
		FROM `member`, `subject_department`, `subject_institute` WHERE  `subject_department`.`sno_department` = `member`.`sno_subject`
		AND `subject_institute`.`sno_institute`=`subject_department`.`sno_institute` AND `sno_member` = '".$sno_member."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		$out['sno_member']=$row['sno_member'];
		$out['name']=$row['name'];
		$out['email']=$row['email'];
		$out['department']=$row['department'];
		$out['institute']=$row['institute'];
		$out['title']=$row['title'];
		$out['office']=$row['office'];
		$out['phone']=$row['phone'];
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//新增活動人員
	case 7:
		$array_number=count($sno_member_s);//陣列數量
		for($i=0;$i<$array_number;$i++)
			$result=$db->query("INSERT INTO `attend` SET `sno_member` = '".$sno_member_s[$i]."', `sno_project` ='".$sno_project."';");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//刪除活動人員
	case 8:
		$array_number=count($sno_member_s);//陣列數量
		for($i=0;$i<$array_number;$i++)
			$result=$db->query("DELETE FROM `attend` WHERE `sno_member` = '".$sno_member_s[$i]."' AND `sno_project` = '".$sno_project."';");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//列出所有參加該活動人員名稱
	case 9:
		$resultt=$db->query("SELECT `sno_member` FROM `attend` WHERE `sno_project` = '".$sno_project."';");
		$out=array();
		while($roww = $resultt->fetch_array(MYSQLI_ASSOC)){
			$result=$db->query("SELECT `sno_member`,`name`, `email`, `subject_department`.`department`, `subject_institute`.`institute`, `title`, `office`, `phone`
			FROM `member`, `subject_department`, `subject_institute` WHERE  `subject_department`.`sno_department` = `member`.`sno_subject`
			AND `subject_institute`.`sno_institute`=`subject_department`.`sno_institute` AND `sno_member` = '".$roww['sno_member']."';");
			$row = $result->fetch_array(MYSQLI_ASSOC);
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
	//列出有哪些年分
	case 10:
		$sno_member=$gtoken->get_sno_member($token);//取得人員流水號
		$result=$db->query("SELECT DISTINCT `year` FROM `project` WHERE `sno_member` = '".$sno_member."' and `isDone`='1' order by `year`;");
		$out=array();
		if($result->num_rows>0){
			while($row = $result->fetch_array(MYSQLI_ASSOC)){
				$out1['year']=$row['year'];
				$new_year=$row['year'];
				array_push($out,$out1);
				unset($out1);
			}
			$new_year = $new_year +1;
			$out1['year']=$new_year;
			array_push($out,$out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//更新整體計畫內容
	case 11:
		$result=$db->query("UPDATE `project` SET `project_d1` = '".$project_d1."', `project_d2` = '".$project_d2."', `project_d4` = '".$project_d4."' WHERE `project`.`sno_project` = '".$sno_project."';");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//新增重要活動規劃
	case 12:
		$result=$db->query("INSERT INTO `project_plan` (`plan_date`, `plan_text`, `sno_project`) VALUES ('".$plan_date."', '".$plan_text."', '".$sno_project."');");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//刪除重要活動規劃
	case 13:
		$array_number=count($sno_plan);//陣列數量
		for($i=0;$i<$array_number;$i++)
			$result=$db->query("DELETE FROM `project_plan` WHERE `sno_plan` = '".$sno_plan[$i]."';");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//列出所有重要活動規劃
	case 14:
		$result=$db->query("SELECT `sno_plan`, `plan_date`, `plan_text` FROM `project_plan` WHERE `sno_project` = '".$sno_project."';");
		$out=array();
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_plan']=$row['sno_plan'];
			$out1['plan_date']=$row['plan_date'];
			$out1['plan_text']=$row['plan_text'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//列出經費項目
	case 15:
		$result=$db->query("SELECT `sno_funding`, `funding_name` FROM `funding` where `year`='".$year."';");
		$out=array();
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_funding']=$row['sno_funding'];
			$out1['funding_name']=$row['funding_name'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//列出所有經費預算總表
	case 16:
		$result=$db->query("select `sno_money`, `sno_project`, `money`.`sno_funding`, `funding`.`funding_name`, `money_price`, `money_count`, `money_description`
		from `money` inner join `funding` on `money`.`sno_funding` = `funding`.`sno_funding` WHERE `money`.`sno_project` = '".$sno_project."'");
		$out=array();
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_money']=$row['sno_money'];
			$out1['sno_project']=$row['sno_project'];
			$out1['sno_funding']=$row['sno_funding'];
			$out1['funding_name']=$row['funding_name'];
			$out1['money_price']=$row['money_price'];
			$out1['money_count']=$row['money_count'];
			$out1['money_description']=$row['money_description'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//新增經費預算
	case 17:
		$result=$db->query("INSERT INTO `money` SET `sno_funding` = '".$sno_funding."', `sno_project` = '".$sno_project."', `money_price` = '".$money_price."', `money_count` = '".$money_count."', `money_description` = '".$money_description."';");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//刪除經費預算
	case 18:
		$array_number=count($sno_money);//陣列數量
		for($i=0;$i<$array_number;$i++)
			$result=$db->query("DELETE FROM `money` WHERE `sno_money` = '".$sno_money[$i]."';");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//編輯第一頁的全部(除了最下面的列表)
	case 19:
		$result=$db->query("SELECT `project`.`sno_project`, `project`.`year`, `project`.`project_name`, `project`.`project_time`, `project`.`project_type`, `project`.`sno_member`, `project`.`created_at`, `member`.`name`, `member`.`email`, `subject_department`.`sno_department`, `subject_department`.`department`,
		`subject_institute`.`sno_institute`, `subject_institute`.`institute`, `member`.`title`, `member`.`office`, `member`.`phone` FROM `project`
		LEFT JOIN `member` ON `member`.`sno_member` = `project`.`sno_member` LEFT JOIN `subject_department` ON `member`.`sno_subject` = `subject_department`.`sno_department`
		LEFT JOIN `subject_institute` ON `subject_institute`.`sno_institute` = `subject_department`.`sno_institute` WHERE `sno_project` = '".$sno_project."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
        $out['sno_project']=$row['sno_project'];
        $out['year']=$row['year'];
		$out['created_at']=$row['created_at'];
		$out['project_name']=$row['project_name'];
		$out['project_time']=$row['project_time'];
		$out['project_type']=$row['project_type'];
		$out['sno_member']=$row['sno_member'];
		$out['name']=$row['name'];
		$out['email']=$row['email'];
		$out['sno_department']=$row['sno_department'];
		$out['department']=$row['department'];
		$out['sno_institute']=$row['sno_institute'];
		$out['institute']=$row['institute'];
		$out['title']=$row['title'];
		$out['office']=$row['office'];
		$out['phone']=$row['phone'];
		$result=$db->query("SELECT `project`.`sno_project`, `project`.`assistant`, `member`.`name`, `member`.`email`, `subject_department`.`sno_department`, `subject_department`.`department`,
		`subject_institute`.`sno_institute`, `subject_institute`.`institute`, `member`.`title`, `member`.`office`, `member`.`phone`,`project`.`assistant_desc` FROM `project`
		LEFT JOIN `member` ON `member`.`sno_member` = `project`.`assistant` LEFT JOIN `subject_department` ON `member`.`sno_subject` = `subject_department`.`sno_department`
		LEFT JOIN `subject_institute` ON `subject_institute`.`sno_institute` = `subject_department`.`sno_institute` WHERE `sno_project` = '".$sno_project."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		$out['assistant']=$row['assistant'];
		$out['assistant_name']=$row['name'];
		$out['assistant_email']=$row['email'];
		$out['assistant_sno_department']=$row['sno_department'];
		$out['assistant_department']=$row['department'];
		$out['assistant_sno_institute']=$row['sno_institute'];
		$out['assistant_institute']=$row['institute'];
		$out['assistant_title']=$row['title'];
		$out['assistant_office']=$row['office'];
		$out['assistant_phone']=$row['phone'];
		$out['assistant_desc']=$row['assistant_desc'];

		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//編輯第二頁的1,2,4
	case 20:
		$result=$db->query("SELECT `project_d1`, `project_d2`, `project_d4` FROM `project` WHERE `sno_project` = '".$sno_project."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		$out['project_d1']=$row['project_d1'];
		$out['project_d2']=$row['project_d2'];
		$out['project_d4']=$row['project_d4'];

		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//詳細資料第一頁的全部(除了最下面的列表)
	case 21:
		$result=$db->query("SELECT `project`.`sno_project`, `project`.`project_name`, `project`.`project_time`, `project`.`project_type`, `project`.`sno_member`, `project`.`created_at`, `member`.`name`, `member`.`email`, `subject_department`.`sno_department`, `subject_department`.`department`,
		`subject_institute`.`sno_institute`, `subject_institute`.`institute`, `member`.`title`, `member`.`office`, `member`.`phone` FROM `project`
		LEFT JOIN `member` ON `member`.`sno_member` = `project`.`sno_member` LEFT JOIN `subject_department` ON `member`.`sno_subject` = `subject_department`.`sno_department`
		LEFT JOIN `subject_institute` ON `subject_institute`.`sno_institute` = `subject_department`.`sno_institute` WHERE `sno_project` = '".$sno_project."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		$out['sno_project']=$row['sno_project'];
		$out['created_at']=$row['created_at'];
		$out['project_name']=$row['project_name'];
		$out['project_time']=$row['project_time'];
		$out['project_type']=$row['project_type'];
		$out['sno_member']=$row['sno_member'];
		$out['name']=$row['name'];
		$out['email']=$row['email'];
		$out['sno_department']=$row['sno_department'];
		$out['department']=$row['department'];
		$out['sno_institute']=$row['sno_institute'];
		$out['institute']=$row['institute'];
		$out['title']=$row['title'];
		$out['office']=$row['office'];
		$out['phone']=$row['phone'];
		$result=$db->query("SELECT `project`.`sno_project`, `project`.`assistant`, `member`.`name`, `member`.`email`, `subject_department`.`sno_department`, `subject_department`.`department`,
		`subject_institute`.`sno_institute`, `subject_institute`.`institute`, `member`.`title`, `member`.`office`, `member`.`phone`,`project`.`assistant_desc` FROM `project`
		LEFT JOIN `member` ON `member`.`sno_member` = `project`.`assistant` LEFT JOIN `subject_department` ON `member`.`sno_subject` = `subject_department`.`sno_department`
		LEFT JOIN `subject_institute` ON `subject_institute`.`sno_institute` = `subject_department`.`sno_institute` WHERE `sno_project` = '".$sno_project."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		$out['assistant']=$row['assistant'];
		$out['assistant_name']=$row['name'];
		$out['assistant_email']=$row['email'];
		$out['assistant_sno_department']=$row['sno_department'];
		$out['assistant_department']=$row['department'];
		$out['assistant_sno_institute']=$row['sno_institute'];
		$out['assistant_institute']=$row['institute'];
		$out['assistant_title']=$row['title'];
		$out['assistant_office']=$row['office'];
		$out['assistant_phone']=$row['phone'];
		$out['assistant_desc']=$row['assistant_desc'];

		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//詳細資料第二頁的1,2,4
	case 22:
		$result=$db->query("SELECT `project_d1`, `project_d2`, `project_d4` FROM `project` WHERE `sno_project` = '".$sno_project."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		$out['project_d1']=$row['project_d1'];
		$out['project_d2']=$row['project_d2'];
		$out['project_d4']=$row['project_d4'];

		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
}
echo json_encode(array(
	'msg' =>'209'
));
