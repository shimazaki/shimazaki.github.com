#!/usr/bin/perl

$ENV{'TZ'} = "JST-9";
print "Content-type: text/plain\n\n";
print "Hello, CGI!\n";
print `date`;