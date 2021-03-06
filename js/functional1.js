//#region var declaration
const HIBP_API_URL = 'https://api.pwnedpasswords.com/range/';
const DB_URL = "http://0.0.0.0:5984/userInfo";
const BREACHED_PASSWORD_TEXT = "Your password must not be contained in the list of breached passwords";
const BAD_USERNAME_PASSWORD_COMBO = "This username and password combo doesn't exist.";
const BREACH_ERRORMESSAGE = "breach";
const BADCOMBO_ERRORMESSAGE = "badCombo";

if (document.getElementById("name") !== null) {
    var lastname = document.getElementById("name");
}
if (document.getElementById("password") !== null) {
    var password = document.getElementById("password");
}

if (document.getElementById('username') !== null) {
    var username = document.getElementById('username');
}

if (document.getElementById("psswdLength") !== null) {
    var classListPLength = document.getElementById("psswdLength").classList;
}

//#endregion

//#region Login + signup
// onClick "login"
function Login() {
    var result = false;
    if (isGoodUserPasswordCombo()) {
        result = true;
    } else {
        badCombo();
        logError("badCombo");
    }
    return result;
}

// onClick "register"
function SignUp() {
    var result = false;
    if (passwordIsOK()) {
        result = true;
        createUser();
    }
    return result;
}
//#endregion

//#region password checker
// control validity of password
function passwordIsOK() {
    var result = false;
    if (lengthIsOK()) {
        if (!psswdIsBreached()) {
            result = true;
        }
    }
    return result;
}

// control if password length is least 8
function lengthIsOK() {
    var result = false;
    changeClassLBad();
    if (password.value.length >= 8) {
        changeClassLGood();
        result = true;
    }
    return result;
}

// control if password is breached
function psswdIsBreached() {
    var result = false;
    var hash = SHA1(password.value);
    var prefix = hash.substring(0, 5);
    var suffix = hash.substring(5, hash.length)

    axios.get(`${HIBP_API_URL}/${prefix}`).then(response => {
        var responseOnePerLine = response.data.split("\n");

        for (var i = 0; i < responseOnePerLine.length; i++) {
            var data = responseOnePerLine[i].split(":");


            if (data[0].toLowerCase() == suffix) {
                logError(BREACH_ERRORMESSAGE);
                document.getElementById("psswdBreach").innerHTML = BREACHED_PASSWORD_TEXT;
                return result = true;
            }
        }
        return result;
    }).catch(error => console.error('On get API Answer error', error));
}

/**
 * Secure Hash Algorithm (SHA1)
 * http://www.webtoolkit.info/
 **/
function SHA1(msg) {
    function rotate_left(n, s) {
        var t4 = (n << s) | (n >>> (32 - s));
        return t4;
    };

    function lsb_hex(val) {
        var str = '';
        var i;
        var vh;
        var vl;
        for (i = 0; i <= 6; i += 2) {
            vh = (val >>> (i * 4 + 4)) & 0x0f;
            vl = (val >>> (i * 4)) & 0x0f;
            str += vh.toString(16) + vl.toString(16);
        }
        return str;
    };

    function cvt_hex(val) {
        var str = '';
        var i;
        var v;
        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            str += v.toString(16);
        }
        return str;
    };

    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, '\n');
        var utftext = '';
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    var blockstart;
    var i, j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A, B, C, D, E;
    var temp;
    msg = Utf8Encode(msg);
    var msg_len = msg.length;
    var word_array = new Array();
    for (i = 0; i < msg_len - 3; i += 4) {
        j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
        word_array.push(j);
    }
    switch (msg_len % 4) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
            break;
        case 3:
            i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
            break;
    }
    word_array.push(i);
    while ((word_array.length % 16) != 14) word_array.push(0);
    word_array.push(msg_len >>> 29);
    word_array.push((msg_len << 3) & 0x0ffffffff);
    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
        for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;
        for (i = 0; i <= 19; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 20; i <= 39; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 40; i <= 59; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 60; i <= 79; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }
    var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

    return temp.toLowerCase();
}


//#endregion

//#region class change for colours
// change colours of password rules
function changeClassLGood() {
    classListPLength.remove("badPsswd");
    classListPLength.add("goodPsswd");
}

function changeClassLBad() {
    classListPLength.remove("goodPsswd");
    classListPLength.add("badPsswd");
}

function badCombo() {
    document.getElementById('wrongCombo').innerHTML = BAD_USERNAME_PASSWORD_COMBO;
}
//#endregion

//#region Erase button
function EraseBase() {
    username.value = "";
    password.value = "";
}

function Erase() {
    EraseBase();
    lastname.value = "";
    document.getElementById('firstname').value = "";
    document.getElementById('addressline').value = "";
    document.getElementById("Email").value = "";
    document.getElementById("Saved").innerHTML = "";
    if (lastname != null) {
        lastname.focus();
    } else {
        username.focus();
    }
}
//#endregion

//#region CreatingUser
function createUser() {
    /* router.post('', (req, res) => {
        axios.post(DB_URL, req.body)
            .then(response => res.redirect('/welcome'))
            .catch(error => console.log(error));
    }) */


    var jsonData = {
        "name": document.getElementById("name").value,
        "firstName" : document.getElementById("firstname").value,
        "adressLine" : document.getElementById("addressline").value,
        "userName" : document.getElementById("username").value,
        "email" : document.getElementById("email").value,
        "password" : document.getElementById("password").value
    };
    axios.post(DB_URL,JSON.stringify(jsonData));
    /* axios.post(DB_URL)
        .then(response => res.redirect('/welcome'))
        .catch(error => console.log(error)); */
}
//#endregion

//#region check login
function isGoodUserPasswordCombo() {
    var result = false;

    if (isExistingUsername()) {
        if (isMatchingPassword()) {
            result = true;
        }
    }
    return result;
}

// check database to see if user exists
function isExistingUsername() {
    var result = false;

    /* axios.get(`${DB_URL}`).then(response => {
        //console.log(response);
        var responseOnePerLine = response.data.split("\n");
                //console.log(responseOnePerLine);
        for (var i = 0; i < responseOnePerLine.length; i++) {
            var data = responseOnePerLine[i].split(":");
                    //console.log(data);
            if (data[0] == username) {
                result = true;
            }
        }
        return result;
    }).catch(error => console.error('On get API Answer error', error)); */
    return result;
}

// Check if given password matches username
function isMatchingPassword() {
    var result = false;
    /* axios.get(`${DB_URL}`).then(response => {
        //console.log(response);
        var responseOnePerLine = response.data.split("\n");
                //console.log(responseOnePerLine);
        for (var i = 0; i < responseOnePerLine.length; i++) {
            var data = responseOnePerLine[i].split(":");
                    //console.log(data);
            if (data[0] == password) {
                result = true;
            }
        }
        return result;
    }).catch(error => console.error('On get API Answer error', error)); */
    return result;
}

//#endregion

//#region errors
function logError(error) {
    switch (error) {
        case BREACH_ERRORMESSAGE:
            console.error("Password has been breached");
            break;
        case BADCOMBO_ERRORMESSAGE:
            console.error("Either the given password or username is incorrect");
        default:
            console.error("There's something wrong, but I don't know what.");
    }
}
//#endregion