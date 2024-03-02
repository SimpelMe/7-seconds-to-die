<!doctype html>
<html lang="en">

<head>
	<?php include dirname($_SERVER['DOCUMENT_ROOT']) . "/simpel.cc/php/head.php"; ?>
	<link rel="stylesheet" type="text/css" href="style.min.css">
</head>

<body onKeyDown="keys(event,'d')" onKeyUp="keys(event,'u')">

	<header>
		<?php include dirname($_SERVER['DOCUMENT_ROOT']) . "/simpel.cc/php/header.php"; ?>
	</header>

	<main>
		<noscript>
			<b>Warning: JavaScript had to be enabled.</b>
			<br><br>
		</noscript>
		<details>
			<summary>How to die</summary>
			<p>With this tool you can transfer text from one device to another.</p>
			<p>On device one you put with "paste" your clipboard into a pastebin. With "pull + copy" on device two you fill that clipboard with this bin. But hurry up! 7 seconds after pasting the bin will be killed.</p>
		</details>
		<form id="buttons" action="javascript:void(0);">
			<button type="button" name="paste" id="paste" onclick="pasteToBin()" title="push button to send clipboard content to server">Paste [1]</button>
			<button type="button" name="pull" id="pull" onclick="pullFromBin()" title="push button to pull content from server">Pull [2]</button>
			<button type="button" name="copy" id="copy" onclick="putToClipboard()" title="push button to put content to clipboard" disabled>Copy [3]</button>
			<button type="button" name="reset" id="reset" onclick="deleteUserCredentials()" title="push button to reset the phrase">Reset</button>
		</form>
		<form id="pasteform">
			<label for="pastebin">Content of vanishing pastebin:</label>
			<textarea id="pastebin" class="fadeout" name="pastebin" readonly tabindex="-1"></textarea>
		</form>
	</main>

	<script src="aes.min.js"></script>
	<script src="phrase.min.js"></script>
	<script src="functions.min.js"></script>
</body>

</html>
