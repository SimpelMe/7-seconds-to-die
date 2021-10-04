var urlHost = window.location.origin + window.location.pathname; // with trailing slash
var user = "";
var password = "";

function encrypt(message) {
  var encrypted = CryptoJS.AES.encrypt(message, password);
  return encrypted;
}

function decrypt(message) {
  var decrypted = CryptoJS.AES.decrypt(message, password);
  var string = decrypted.toString(CryptoJS.enc.Utf8);
  return string;
}

function setUsername() {
  var userprompt = ""
  while (userprompt === "") {
    userprompt = prompt("Bitte Namen eingeben.\n\nEs sind nur die Zeichen a-Z, 0-9 und _ erlaubt.\n", "");
    userprompt = userprompt.replace(/[^\w\d]/gi, ''); // nur a-Z, 0-9 und _
    userprompt = userprompt.trim(); // deletes trailing and leading whitespaces
    if (userprompt == null) { // kein user eingegeben
      userprompt = "";
    }
  }
  user = userprompt;
  document.getElementById("reset").innerText = "Reset Login '" + user + "'";
  document.getElementById("resetiPhone").innerText = "Reset Login '" + user + "'";
  setPassword();
}

function setPassword() {
  var pw = ""
  while (pw === "") {
    pw = prompt("Bitte Passwort eingeben.\n\nEs sind nur die Zeichen a-Z, 0-9 und _ erlaubt.\n", "");
    pw = pw.replace(/[^\w\d]/gi, ''); // nur a-Z, 0-9 und _
    if (pw == null) {
      pw = "";
    }
  }
  password = pw;
}

function deleteUserCredentials() {
  user = "";
  password = "";
  setUsername();
}

function keys(e, r) // r fuer Richtung der Taste:     'd' down    'u' up
{
  if (e.key == "1" && r == 'u') pasteToBin();
  if (e.key == "2" && r == 'u') copyFromBin();
}

function copyFromBin() {
	deleteOlderFiles();
  if (user == "" || user == null || password == "" || password == null) {
    setUsername();
  }
  var rawFile = new XMLHttpRequest();
  var userlowercase = user.toLowerCase();
  var url = urlHost + userlowercase + ".txt?" + new Date().getTime();
  rawFile.open("GET", url, true);
  var allText
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        allText = rawFile.responseText;
        allText = decodeURIComponent(allText);
        allText = decrypt(allText);
        var pastebin = document.getElementById("pastebin")
        pastebin.innerText = allText;
        // copy to clipboard
        if (iOS()) {
          // save current contentEditable/readOnly status
          var editable = pastebin.contentEditable;
          var readOnly = pastebin.readOnly;
          // convert to editable with readonly to stop iOS keyboard opening
          pastebin.contentEditable = true;
          pastebin.readOnly = true;
          // create a selectable range
          var range = document.createRange();
          range.selectNodeContents(pastebin);
          // select the range
          var selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          pastebin.setSelectionRange(0, 999999);
          // restore contentEditable/readOnly to original state
          pastebin.contentEditable = editable;
          pastebin.readOnly = readOnly;
        } else {
          pastebin.focus();
          pastebin.select();
          pastebin.setSelectionRange(0, 99999); /* For mobile devices */
        }
        // navigator.clipboard.writeText(allText) // this new API is not working with iOS the way I want
        document.execCommand("copy");

        // fill in again to deselect
        pastebin.innerText = allText;
        // restart fading animation of pastebin
        // removing the class
        pastebin.classList.remove("fadeout");
        // triggering reflow /* The actual magic */
        // without this it wouldn't work. Try uncommenting the line and the transition won't be retriggered.
        pastebin.offsetWidth = pastebin.offsetWidth;
        // and re-adding the class
        pastebin.classList.add("fadeout");
        // remove content after 7 seconds
        setTimeout(function() {
          pastebin.innerText = "";
        }, 7000);
      }
    }
  }
  rawFile.send(null);
}

function pasteToBin() {
	deleteOlderFiles();
  if (user == "" || user == null || password == "" || password == null) {
    setUsername();
  }
  navigator.clipboard.readText()
    .then(text => {
      var pastebin = document.getElementById("pastebin")
      pastebin.innerText = text;
      // restart fading animation of pastebin
      // removing the class
      pastebin.classList.remove("fadeout");
      // triggering reflow /* The actual magic */
      // without this it wouldn't work. Try uncommenting the line and the transition won't be retriggered.
      pastebin.offsetWidth = pastebin.offsetWidth;
      // and re-adding the class
      pastebin.classList.add("fadeout");
      // delete content after 7 seconds
      setTimeout(function() {
        pastebin.innerText = "";
      }, 7000);
			// sending paste
      var http = new XMLHttpRequest();
      var url = urlHost + 'read.php';
      var params = text;
      http.open('POST', url, true);
      //Send the proper header information along with the request
      http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      http.onreadystatechange = function() { //Call a function when the state changes.
        if (http.readyState == 4 && http.status == 200) {
          //console.log("ready-Response: \n" + http.responseText);
        }
      }
      var userlowercase = user.toLowerCase();
      //console.log("before encrypt: " + params);
      params = encrypt(params);
      //console.log("after encrypt: " + params);
      params = encodeURIComponent(params);
      //console.log("after URI: " + params);
      http.send("user=" + userlowercase + "&text=" + params);
    })
    .catch(err => {
      console.error('Failed to read clipboard content: ', err);
    });
}

function iOS() {
  const iOS_1to12 = /iPad|iPhone|iPod/.test(navigator.platform);
  const iOS13_iPad = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const iOS1to12quirk = function() {
    var audio = new Audio(); // temporary Audio object
    audio.volume = 0.5; // has no effect on iOS <= 12
    return audio.volume === 1;
  };
  const isIOS = !window.MSStream && (iOS_1to12 || iOS13_iPad || iOS1to12quirk());
  // console.log("Is iOS: " + isIOS);
  return isIOS
}

function deleteOlderFiles() {
	var http = new XMLHttpRequest();
	var url = urlHost + 'delete.php';
	http.open('POST', url, true);
	//Send the proper header information along with the request
	http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	http.onreadystatechange = function() { //Call a function when the state changes.
		if (http.readyState == 4 && http.status == 200) {
			//console.log("ready-Response: \n" + http.responseText);
		}
	}
	http.send("");
}

setUsername();
deleteOlderFiles();
