<?php
    $command = "matlab";
    exec($command);
    echo "The following command was run: ".$command."<br/>";
    echo $filename." was created in ".$outputDir."<br/>";
?>