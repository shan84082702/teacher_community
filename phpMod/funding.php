<?php
header('Content-Type: application/json; charset=UTF-8');
include("fig.php");
@$token = $_POST["token"];
@$method = $_POST["method"];
@$year = $_POST["year"];
@$funding_name = $_POST["funding_name"];
@$sno_funding = $_POST["sno_funding"];

$db=new database;//資料庫
$gtoken=new get_token;//token
$gtoken->token_check($token);//檢查token

switch ($method) {
	//列出年份
	case 0:
		$result=$db->query("SELECT DISTINCT `year` FROM `funding` WHERE 1 order by `year`;");
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
    //列出經費項目列表
    case 1:
		$result=$db->query("SELECT `sno_funding`, `funding_name`, `updated_at` FROM `funding` WHERE `year`='".$year."';");
		$out=array();
		while($row = $result->fetch_array(MYSQLI_ASSOC)){
            $out1['sno_funding']=$row['sno_funding'];
            $out1['funding_name']=$row['funding_name'];
            $out1['updated_at']=$row['updated_at'];
			array_push($out,$out1);
			unset($out1);
		}
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
        break;
    //新增經費項目
    case 2:
        $result=$db->query("INSERT INTO `funding` SET `year` = '".$year."', `funding_name` = '".$funding_name."';");
        echo json_encode(array(
            'msg' =>'200'
        ));
        exit;
        break;
    //刪除經費項目
    case 3:
		$array_number=count($sno_funding);//陣列數量
		for($i=0;$i<$array_number;$i++)
			$result=$db->query("DELETE FROM `funding` WHERE `sno_funding` = '".$sno_funding[$i]."';");
		echo json_encode(array(
			'msg' =>'200'
		));
		exit;
        break;
    //取得某一項經費項目
    case 4:
		$result=$db->query("SELECT `sno_funding`, `funding_name` FROM `funding` WHERE `sno_funding`='".$sno_funding."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
        $out['sno_funding']=$row['sno_funding'];
        $out['funding_name']=$row['funding_name'];
		echo json_encode(array(
			'msg' =>'200',
			'out'=>$out
		));
		exit;
        break;
    //編輯經費項目
    case 5:
        $result=$db->query("UPDATE `funding` SET `funding_name`='".$funding_name."' WHERE `sno_funding`='".$sno_funding."';");
        echo json_encode(array(
            'msg' =>'200'
        ));
        exit;
        break;
}
echo json_encode(array(
	'msg' =>'209'
));
