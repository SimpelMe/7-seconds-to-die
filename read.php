<?php
  $user = $_POST["user"];
  $file = $user . '.txt';
  $data = $_POST["text"];
  // allow only alphanumeric to avoid creating file outside this folder
  if (ctype_alnum($user)) {
    file_put_contents($file, $data, LOCK_EX);
  }
  // Sometimes a .txt (w/o user) is created - delete it immediately
  unlink(".txt");
?>
