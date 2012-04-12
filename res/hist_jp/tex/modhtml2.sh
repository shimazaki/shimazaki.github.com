cd "$1"

find . -maxdepth 1 -type f -name '*.html' | while read html; do
    echo "$html"
    #perl -i -p0777e "s/<body\s.*?\w.*? leftmargin=20>/<body><div class=\"box\">/gi" "$html"
    #perl -i -p0777e "s/(<link\s.*?HREF=)(['\"]?)\w.*.css/\$1\$2..\/css\/latex2html.css/gi" "$html"
    perl -i -p0777e "s/<\/HEAD>/<script src=http:\/\/www.google-analytics.com\/urchin.js type=text\/javascript><\/script>\n<script type=text\/javascript>_uacct=\"UA-745872-1\";urchinTracker();<\/script>\n<\/HEAD>/gi" "$html"
    perl -i -p0777e "s/<BODY >/<BODY>
    <a name=top id=top> <\/a>
    <div id=NaviLayer>  
    <table width=130 border=0 cellpadding=0 cellspacing=0>
    <tr><td height=28 valign=top><a href=\#top class=style22>TOP<\/a><\/td><\/tr>
    <tr><td height=28 valign=top>Spike Generation<\/td><\/tr>
    <tr><td height=28 valign=top><a href=..\/histogram.html>Histogram<\/a><\/td><\/tr>
    <tr><td height=28 valign=top><a href=..\/..\/index_jp.html class=style22>H. Shimazaki<\/a><\/td><\/tr>
    <\/table><\/div>/gi" "$html"
    perl -i -p0777e "s/AddressShimazaki/\&copy; 2008 <a href=http:\/\/2000.jukuin.keio.ac.jp\/shimazaki>H. Shimazaki<\/a>/gi" "$html"
done

