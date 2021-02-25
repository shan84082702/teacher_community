<?php
use PHPMailer\PHPMailer\PHPMailer;
date_default_timezone_set("Asia/Taipei");
class database{
	private $servername = 'localhost';
	private $username = 'cubecube';
	private $password = 'pupuyueyue';
	private $dbname = 'teacher';
	public $con;
	public $result;
	public $dbdest_path = 'phpMod/upload/';
	public $dest_path = 'upload/';
	
    function __construct(){
		$this->con = new mysqli($this->servername, $this->username, $this->password, $this->dbname);
    }
    function query($sql_string){
        $result = $this->con->query($sql_string);
        return $result;
    }
	function query2($sql_string){
        $this->con->multi_query($sql_string);
		$this->con->store_result();
		$this->con->next_result();
		$result=$this->con->store_result();
        return $result;
    }
}
class get_token{
	private $keyy='benson';
	function decrypt($input){//解密
		$output = openssl_decrypt(base64_decode($input), 'AES-128-ECB', $this->keyy, OPENSSL_RAW_DATA);
		return $output;
	}
	function encrypt($input){//加密
		$data = openssl_encrypt($input, 'AES-128-ECB', $this->keyy, OPENSSL_RAW_DATA);
		$data = base64_encode($data);
		return $data;
	}
	function get_sno_member($input){//取的sno_member
		$token = $this->decrypt($input); //token解密
		$de_token = json_decode($token, true);
		$output = $de_token['sno_member'];//使用者sno_member
		return $output;
	}
	function token_check($token){//檢查token是否過期或不存在
		$db_gtoken=new database;
		$result=$db_gtoken->query("SELECT count(`token`) AS 'exist' FROM `member` WHERE `token` = '".$token."';");
		$row = $result->fetch_array(MYSQLI_ASSOC);
		if ($row['exist']==1) { //token存在
			$token = $this->decrypt($token); //token解密
			$de_token = json_decode($token, true);
			$oldtime = $de_token['now_time'];//上一次登入時間
			$now_time = date("ymdHis");//現在時間
			$time = $now_time - $oldtime;
			if ($time > 1000000){ //token 過期
				echo json_encode(array(
					'msg' => '204'
				));
				exit;
			}
		} 
		else {//token不存在
			echo json_encode(array(
				'msg' => '206'
			));
			exit;
		}
	}
}
class email_data{
	private $uacc='widelab@widelab.org';
	private $upasswd='widelab35795709';
	function __construct(){
		//Load composer's autoloader
		require 'vendor/autoload.php';
    }
	function send_email($to_email,$email_header,$content){//寄信
		$mail = new PHPMailer(); //建立新物件
		$mail->SMTPDebug = 2;
		$mail->IsSMTP(); //設定使用SMTP方式寄信
		$mail->SMTPAuth = true; //設定SMTP需要驗證
		$mail->SMTPSecure = "ssl"; // Gmail的SMTP主機需要使用SSL連線
		$mail->Host = "smtp.gmail.com"; //Gamil的SMTP主機
		$mail->Port = 465; //Gamil的SMTP主機的埠號(Gmail為465)。
		$mail->CharSet = "utf-8"; //郵件編碼
		$mail->Username = $this->uacc; //Gamil帳號
		$mail->Password = $this->upasswd; //Gmail密碼
		$mail->From = $this->uacc; //寄件者信箱
		$mail->FromName = "長庚大學教師社群系統"; //寄件者姓名
		$mail->Subject = $email_header; //郵件標題
		$mail->Body = $content; //郵件內容(忘記密碼的網頁)
		//$mail->addAttachment('../uploadfile/file/dirname.png', 'new.jpg'); //附件，改以新的檔名寄出
		$mail->IsHTML(true); //郵件內容為html
		$mail->AddAddress($to_email); //收件者郵件及名稱

		if (!$mail->Send()) {
			echo json_encode(array(
				'msg' => '403',
				'out' => "Error: " . $mail->ErrorInfo,
			));
		} 
		/*else {
			echo json_encode(array(
				'msg' => '200',
				'out' => "",
			));
		}*/
	}
	
}