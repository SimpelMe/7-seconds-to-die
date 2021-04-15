<?php
  $file = preg_replace('/\W/','', $_POST["user"]) . '.txt';
  $data = $_POST["text"];
  file_put_contents($file, $data, LOCK_EX);
?>
