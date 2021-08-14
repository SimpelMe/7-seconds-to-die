<?php
  delete();
  sleep(8);
  delete();

  function delete() {
    // Sometimes a .txt is created - delete it immediately
    unlink(".txt");
    // delete all *.txt older then 7 seconds
    $expire = strtotime('-7 SECONDS');
    $files = glob('*.txt');
    // print_r($files);
    foreach ($files as $file) {
      // Skip anything that is not a file
      if (!is_file($file)) {
        continue;
      }
      // Skip any files that have not expired
      if (filemtime($file) > $expire) {
        continue;
      }
      unlink($file);
    }
  }
?>
