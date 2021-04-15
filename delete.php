<?php
  delete();
  sleep(8);
  delete();
  
  function delete() {
    $expire = strtotime('-7 SECONDS');
    $files = glob('*.txt');
    print_r($files);
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
