<?php
  $file = $_POST["user"] . '.txt';
  $data = $_POST["text"];
  file_put_contents($file, $data, LOCK_EX);
  // Sometimes a .txt (w/o user) is created - delete it immediately
  unlink(".txt");
?>
