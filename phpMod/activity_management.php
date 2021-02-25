<?php
header('Content-Type: application/json; charset=UTF-8');
include("fig.php");
@$token = $_POST["token"];
@$method = $_POST["method"];
@$sno_project = $_POST["sno_project"];
@$plan_text = $_POST["plan_text"];
@$plan_date = $_POST["plan_date"];
@$sno_plan = $_POST["sno_plan"];
@$plan_date_end = $_POST["plan_date_end"];
@$plan_location = $_POST["plan_location"];
@$plan_people = $_POST["plan_people"];
@$plan_record = $_POST["plan_record"];
@$file_path = $_POST["file_path"];
@$year = $_POST["year"];
$db=new database;//資料庫
$gtoken=new get_token;//token
$gtoken->token_check($token);//檢查token
$out=array();//輸出陣列
/*$hours=array();
$sno_attend=array();
array_push($hours,1);
array_push($hours,1.5);
array_push($sno_attend,16);
array_push($sno_attend,17);*/
switch ($method) {
	//選擇社群
	case 1:
		$result=$db->query("SELECT `sno_project`, `project_name` FROM `project` WHERE `project`.`isDone` = '1' AND `project`.`year` = '".$year."' AND (`sno_member` = '".$gtoken->get_sno_member($token)."' OR `assistant` = '".$gtoken->get_sno_member($token)."' 
		OR '1' = (SELECT `member`.`sno_role` FROM `member` WHERE `member`.`sno_member` = '".$gtoken->get_sno_member($token)."'))");
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_project']=$row['sno_project'];
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
    //列出活動列表
	case 2:
		$result=$db->query("SELECT `sno_plan`, `plan_text`, `plan_date`, `plan_date_end`, `plan_status` FROM `project_plan` WHERE `sno_project`='".$sno_project."'");
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_plan']=$row['sno_plan'];
			$out1['plan_text']=$row['plan_text'];
            $out1['plan_date']=$row['plan_date'];
            $out1['plan_date_end']=$row['plan_date_end'];
			$out1['plan_status']=$row['plan_status'];
			array_push($out,$out1);
			unset($out1);
        }
        //觀看可編輯人員或主持人（未完成，審核資料的部分）
        $id=$gtoken->get_sno_member($token);
        $result=$db->query("SELECT COUNT(`sno_project`) AS 'editor' FROM `project` WHERE `sno_project` = '".$sno_project."' AND (`sno_member` = '".$id."' OR `assistant` = '".$id."')  AND `project_approval` != '1'");
        $row = $result->fetch_array(MYSQLI_ASSOC);//sno_project=59
        $edit=$row['editor'];
		echo json_encode(array(
			'msg' =>'200',
            'out'=>$out,
            'edit'=>$edit
		));
		exit;
		break;
	//新增活動
	case 3:
		$result=$db->query("INSERT INTO `project_plan` (`sno_project`, `plan_text`, `plan_date`, `plan_status`) VALUES ('".$sno_project."', '".$plan_text."', '".$plan_date."','未填寫活動紀錄表');");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//修改活動
	case 4:
		$db->query("UPDATE `project_plan` SET `plan_text` = '".$plan_text."', `plan_date` = '".$plan_date."' WHERE `project_plan`.`sno_plan` = '".$sno_plan."';");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//取得活動紀錄表內容
    case 5:
		$result=$db->query("SELECT `sno_plan`, `project`.`sno_project`, `project`.`project_name`, `plan_text`, `plan_date`, `plan_date_end`, `plan_location`, `plan_people`, `plan_record`, `file_path`, `project_plan`.`created_at` FROM `project_plan` 
		LEFT JOIN `project` ON `project`.`sno_project` = `project_plan`.`sno_project` WHERE `project_plan`.`sno_plan` = '".$sno_plan."'");
		$row = $result->fetch_array(MYSQLI_ASSOC);
        $out['sno_plan']=$row['sno_plan'];
        $out['sno_project']=$row['sno_project'];
		$out['project_name']=$row['project_name'];
		$out['plan_text']=$row['plan_text'];
		$out['plan_date']=$row['plan_date'];
		$out['plan_date_end']=$row['plan_date_end'];
		$out['plan_location']=$row['plan_location'];
		$out['plan_people']=$row['plan_people'];
        $out['plan_record']=$row['plan_record'];
        $out['file_path']=$row['file_path'];
        $out['created_at']=$row['created_at'];

		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//儲存活動紀錄表
    case 6:
        $db->query("UPDATE `project_plan` SET `plan_text` = '".$plan_text."', `plan_date` = '".$plan_date."', `plan_date_end` = '".$plan_date_end."', 
        `plan_location` = '".$plan_location."', `plan_people` = '".$plan_people."', `plan_record` = '".$plan_record."' 
        WHERE `project_plan`.`sno_plan` = '".$sno_plan."';");
        echo json_encode(array(
            'msg' =>'200'
        ));
        exit;
        break;
	//活動管理列表的刪除
    case 7:
        $array_number=count($sno_plan);//陣列數量
        for($i=0;$i<$array_number;$i++)
            $db->query("DELETE FROM `project_plan` WHERE `project_plan`.`sno_plan` = ".$sno_plan[$i]."");
        echo json_encode(array(
            'msg' =>'200'
        ));
        exit;
        break;

    //簽到表
    case 8:
		foreach ($_FILES as &$file) {
			if ($file['error'] === UPLOAD_ERR_OK){
				$key = array_search($file, $_FILES);//在$_FILES尋找$file
				$tempfile = $file['tmp_name'];
				$t=time();
				$t1=rand(0,100000);
				$last=explode('.',$file['name']);//檔案類型
				$file['name']=$t.$t1.".".$last[1];
				$dest = $db->dest_path. $file['name'];
				$dbdest = $db->dbdest_path.$file['name'];
				move_uploaded_file($tempfile, $dest);//將檔案移至指定位置
				//新增檔案
				$db->query("UPDATE `project_plan` SET `file_path` = '".$dbdest."', `plan_status` = '已填寫活動紀錄表' 
				WHERE `project_plan`.`sno_plan` = '".$sno_plan."';");
			} 
			else {
				echo json_encode(array(
					'msg' => '205'
				));
				exit;
			}
		}
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
        
        
}
echo json_encode(array(
	'msg' =>'209'
));
