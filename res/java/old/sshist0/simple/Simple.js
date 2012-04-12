// JavaScript Document

var DATA

function PostData() {
	DATA_TEXT = document.DATAFORM.TEXT.value;	// Read texts in a form.		
	
	var DATA_STR;								// DATASTR is an string array.
	DATA_STR = DATA_TEXT.split(/,{1,}|:{1,}|;{1,}|\s{1,}/);			// a{1,}: Match for a, aa, aaa, aaaa
	

}