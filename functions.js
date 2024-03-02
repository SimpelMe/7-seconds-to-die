var urlHost = window.location.origin + window.location.pathname; // with trailing slash
var user = "";
var password = "";
var allText;

function encrypt(message) {
  var encrypted = CryptoJS.AES.encrypt(message, password);
  return encrypted;
}

function decrypt(message) {
  var decrypted = CryptoJS.AES.decrypt(message, password);
  var string = decrypted.toString(CryptoJS.enc.Utf8);
  return string;
}

function cr32enc(r) {
  for (var a, o = [], c = 0; c < 256; c++) {
    a = c;
    for (var f = 0; f < 8; f++) a = 1 & a ? 3988292384 ^ a >>> 1 : a >>> 1;
    o[c] = a
  }
  for (var n = -1, t = 0; t < r.length; t++) n = n >>> 8 ^ o[255 & (n ^ r.charCodeAt(t))];
  return (-1 ^ n) >>> 0
}

function smallHash(text) {
  var cr32 = cr32enc(text);
  var encoded = cr32.toString(32);
  return encoded;
}

function setPhrase() {
  makePhrase() // create phrase with phrase.js
  var userprompt = "";
  while (userprompt === "") {
    userprompt = prompt("Enter a phrase.\nValid characters are: a-Z, 0-9, - and _.\n\nProposal:\n", phrase);
    userprompt = userprompt.replace(/[^\-\w\d]/gi, ''); // nur a-Z, 0-9 und _
    userprompt = userprompt.trim(); // deletes trailing and leading whitespaces
    userprompt = userprompt.toLowerCase(); // only small letters
    if (userprompt == null) { // kein user eingegeben
      userprompt = "";
    }
  }
  phrase = userprompt;
  phrase = smallHash(phrase);
  setCookie("phrase", phrase, 7); // 7 days is maximum set by safari and brave
  // username should be the phrase but every second character omitted
  // This way you won't see the password in the gui on "reset" button
  user = phrase.split('').filter((c, i) => (i + 1) % 2 !== 0).join('');
  document.getElementById("reset").innerText = "Reset user '" + user + "'";
  password = phrase;
}

function queryToPhrase(secret) {
  phrase = secret;
  phrase = smallHash(phrase);
  setCookie("phrase", phrase, 7); // 7 days is maximum set by safari and brave
  // username should be the phrase but every second character omitted
  // This way you won't see the password in the gui on "reset" button
  user = phrase.split('').filter((c, i) => (i + 1) % 2 !== 0).join('');
  document.getElementById("reset").innerText = "Reset user '" + user + "'";
  password = phrase;
  // remove the secret in the url/address bar - so nobody can see this
  history.replaceState("", "", window.location.href.replace(new RegExp("\\?secret=[^&#38;\\n]+$|secret=[^&#38;#]+&#38;"), ""));
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  var tempPhrase = getCookie("phrase");
  if (tempPhrase != "") {
    phrase = tempPhrase;
    setCookie("phrase", phrase, 7); // set again after each reload as 7 days is maximum set by safari and brave
  } else {
    setPhrase()
  }
  user = phrase.split('').filter((c, i) => (i + 1) % 2 !== 0).join('');
  document.getElementById("reset").innerText = "Reset user '" + user + "'";
  password = phrase;
}

function checkQuery() {
  let params = new URLSearchParams(document.location.search);
  let secret = params.get("secret");
  if (secret) {
    queryToPhrase(secret);
  } else {
    checkCookie();
  }
}

function deleteCookies() {
  document.cookie = "phrase=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
}

function deleteUserCredentials() {
  user = "";
  password = "";
  deleteCookies();
  setPhrase();
}

function keys(e, r) // r fuer Richtung der Taste:     'd' down    'u' up
{
  if (e.key == "1" && r == 'd') pasteToBin();
  if (e.key == "2" && r == 'd') pullFromBin();
  if (e.key == "3" && r == 'd') putToClipboard();
}

function pullFromBin() {

	deleteOlderFiles();
  if (user == "" || user == null || password == "" || password == null) {
    setPhrase();
  }
  var rawFile = new XMLHttpRequest();
  // var userlowercase = user.toLowerCase();
  var url = urlHost + user + ".txt?" + new Date().getTime();
  rawFile.open("GET", url, true);

  rawFile.onload = function() {
    if (rawFile.status === 404) {
      // then color pull button red for 2 seconds fading
      var pullButton = document.querySelector('#pull');
      pullButton.classList.add("redbutton");

      // and remove after 2 seconds
      setTimeout(function() {
        var pullButton = document.querySelector('#pull');
        pullButton.classList.remove("redbutton");
      }, 2000);
    }
  };

  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        // then color pull button green for 2 seconds fading
        var pullButton = document.querySelector('#pull');
        pullButton.classList.add("greenbutton");
        // and remove after 2 seconds
        setTimeout(function() {
          var pullButton = document.querySelector('#pull');
          pullButton.classList.remove("greenbutton");
        }, 2000);

        allText = rawFile.responseText;
        allText = decodeURIComponent(allText);
        allText = decrypt(allText);
        var pastebin = document.getElementById("pastebin")
        pastebin.innerText = allText;

        // enable copy button
        var copyButton = document.querySelector('#copy');
        copyButton.removeAttribute("disabled");

        // try to click the button which will put it to clipboard
        // for security reasons in safari (OSX, iOS, iPadOS) some have directly
        // trigger the function with mouse or touch
        // clipboard.writeText can't be nested in safari
        document.querySelector('#copy').click();

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
          allText = "";
          // disable copy button
          var copyButton = document.querySelector('#copy');
          copyButton.setAttribute("disabled", "disabled");
        }, 7000);
      }
    }
  }
  rawFile.send(null);
}

function putToClipboard () {
  var pastebin = document.querySelector('#pastebin');
  if (allText == undefined || allText == "") {
    pastebin.innerText = "NO DATA FOUND";
  } else {
    navigator.clipboard.writeText(allText).then(function() {
      /* clipboard successfully set */
      // pastebin.innerText = "COPIED";

      // then color copy button green for 2 seconds fading
      var copyButton = document.querySelector('#copy');
      copyButton.classList.add("greenbutton");
      // and remove after 2 seconds
      setTimeout(function() {
        var copyButton = document.querySelector('#copy');
        copyButton.classList.remove("greenbutton");
      }, 2000);
    }, function() {
      /* clipboard write failed */
      console.error("writing to clipboard FAILED");
    });
  }
}

function pasteToBin() {
	deleteOlderFiles();
  if (user == "" || user == null || password == "" || password == null) {
    setPhrase();
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
      // var userlowercase = user.toLowerCase();
      //console.log("before encrypt: " + params);
      params = encrypt(params);
      //console.log("after encrypt: " + params);
      params = encodeURIComponent(params);
      //console.log("after URI: " + params);
      http.send("user=" + user + "&text=" + params);
    })
    .catch(err => {
      console.error('Failed to read clipboard content: ', err);
    });
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

checkQuery();
deleteOlderFiles();
