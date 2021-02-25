<?php
header('Content-Type: application/json; charset=UTF-8');
include("fig.php");
@$token = $_POST["token"];
@$method = $_POST["method"];
@$sno_project = $_POST["sno_project"];
@$year = $_POST["year"];
@$hours = $_POST["hours"];
@$sno_attend = $_POST["sno_attend"];
@$report_seniority = $_POST["report_seniority"];
@$report_d1 = $_POST["report_d1"];
@$report_d2 = $_POST["report_d2"];
@$report_d3 = $_POST["report_d3"];
@$report_d4 = $_POST["report_d4"];
@$report_d5 = $_POST["report_d5"];
@$del_file = $_POST["del_file"];
@$insert_des = $_POST["insert_des"];
$insert_des = json_decode($insert_des, true);
$del_file = json_decode($del_file, true);
@$update_file = $_POST["update_file"];
$update_file = json_decode($update_file, true);
@$update_des = $_POST["update_des"];
$update_des = json_decode($update_des, true);
$db=new database;//資料庫
$gtoken=new get_token;//token
$gtoken->token_check($token);//檢查token



/*$hours=array();
$sno_attend=array();
array_push($hours,1);
array_push($hours,1.5);
array_push($sno_attend,16);
array_push($sno_attend,17);*/

switch ($method) {
	//顯示第一部分基本資料
	case 1:
		$result=$db->query("SELECT `project`.`sno_project`,`project`.`project_name`,`project`.`project_time`,`project`.`project_type`,`project`.`report_seniority`,`project`.`sno_member`,`project`.`created_at`,`member`.`name`,
		`subject_department`.`sno_department`,`subject_department`.`department`,`subject_institute`.`sno_institute`,`subject_institute`.`institute`,`member`.`title`
		FROM `project` LEFT JOIN `member` ON `member`.`sno_member` = `project`.`sno_member` LEFT JOIN `subject_department` ON `member`.`sno_subject` = `subject_department`.`sno_department`
		LEFT JOIN `subject_institute` ON `subject_institute`.`sno_institute` = `subject_department`.`sno_institute`
		WHERE `sno_project` = '".$sno_project."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		$out['sno_project']=$row['sno_project'];
		$out['project_name']=$row['project_name'];
		$out['project_time']=$row['project_time'];
        $out['project_type']=$row['project_type'];
        $out['created_at']=$row['created_at'];
		$out['report_seniority']=$row['report_seniority'];
		$out['sno_member']=$row['sno_member'];
		$out['name']=$row['name'];
		$out['title']=$row['title'];
		$out['sno_department']=$row['sno_department'];
		$out['department']=$row['department'];
		$out['sno_institute']=$row['sno_institute'];
		$out['institute']=$row['institute'];
		//成員資料
		$out['member_list']=array();
		$result=$db->query("SELECT `attend`.`sno_attend`,`member`.`sno_member`, `member`.`name`, `subject_department`.`department`, `subject_institute`.`institute`, `title`, `attend`.`attend_hour` FROM `attend` LEFT JOIN `member` ON `attend`.`sno_member` = `member`.`sno_member` 
		LEFT JOIN`subject_department` ON `member`.`sno_subject` = `subject_department`.`sno_department` LEFT JOIN `subject_institute` 
		ON `subject_department`.`sno_institute` = `subject_institute`.`sno_institute` WHERE `attend`.`sno_project` ='".$sno_project."';");
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_attend']=$row['sno_attend'];
			$out1['name']=$row['name'];
			$out1['department']=$row['department'];
			$out1['institute']=$row['institute'];
			$out1['title']=$row['title'];
			$out1['attend_hour']=$row['attend_hour'];
			array_push($out['member_list'],$out1);
			unset($out1);
		}

		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//顯示第二部分社群執行成果
	case 2:
		$result=$db->query("SELECT `project`.`report_d1`, `project`.`report_d2`, `project`.`report_d3`, `project`.`report_d4`, `project`.`report_d5` FROM `project` WHERE `project`.`sno_project` ='".$sno_project."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		$out['report_d1']=$row['report_d1'];
		$out['report_d2']=$row['report_d2'];
		$out['report_d3']=$row['report_d3'];
		$out['report_d4']=$row['report_d4'];
		$out['report_d5']=$row['report_d5'];
		//照片路徑
		$out['file']=array();
		$result=$db->query("SELECT `file`.`sno_file`, `file`.`file_path`, `file`.`file_description` FROM `file` WHERE `file`.`sno_project` ='".$sno_project."';");
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$out1['sno_file']=$row['sno_file'];
			$out1['file_path']=$row['file_path'];
			$out1['file_description']=$row['file_description'];
			array_push($out['file'],$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
		break;
	//更新第一部分基本資料(只有年資跟研習時數可以更新)
	case 3:
		//更新年資
		$db->query("UPDATE `project` SET `report_seniority` = '".$report_seniority."' WHERE `project`.`sno_project` ='".$sno_project."';");
		//更新成員時數
		$number=count($sno_attend);//陣列數量
		for($i=0;$i<$number;$i++)
			$db->query("UPDATE `attend` SET `attend_hour` = '".$hours[$i]."' WHERE `attend`.`sno_attend` = '".$sno_attend[$i]."';");
		
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//更新第二部分基本資料(只有上面的，沒有檔案)
	case 4:
		$db->query("UPDATE `project` SET `report_d1` = '".$report_d1."', `report_d2` = '".$report_d2."', `report_d3` = '".$report_d3."', `report_d4` = '".$report_d4."', `report_d5` = '".$report_d5."' 
		WHERE `project`.`sno_project` = '".$sno_project."'");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
		break;
	//更新第二部分檔案(如果更新檔案會變成先刪除檔案然後新增檔案。更新的部分只有文字更新)
    case 5:
		$i=0;
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
                $db->query("INSERT INTO `file`(`file_path`, `sno_project`, `file_description`) VALUES ('".$dbdest."', '".$sno_project."', '".$insert_des[$i]."')");
                $i++;
            } 
            else {
                echo json_encode(array(
                    'msg' => '205'
                ));
                exit;
            }
        }

		//刪除圖片
        $number=count($del_file);//陣列數量
		for($i=0;$i<$number;$i++)
            $db->query("DELETE FROM `file` WHERE `sno_file` = '".$del_file[$i]."'");
		
		
		//更新檔案
		$number=count($update_des);//陣列數量
		for($i=0;$i<$number;$i++)
			$db->query("UPDATE `file` SET `file_description`='".$update_des[$i]."' WHERE `sno_file`= '".$update_file[$i]."'");
		echo json_encode(array(
            'msg' =>'200'
		));
		exit;
		break;
}
echo json_encode(array(
	'msg' =>'209'
));
