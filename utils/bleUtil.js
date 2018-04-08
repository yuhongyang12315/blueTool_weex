var CryptoJS = require('../lib/aes.js');//aes
var CryptoJSMode = require('../lib/mode-ecb.js')//ECB
var CryptoJSNoPad = require('../lib/pad-nopadding.js')//nopadding

//默认 模式/补码方式"
var mode = CryptoJSMode;
var padding = CryptoJSNoPad;

var key_Int = new Int8Array([32, 87, 47, 82, 54, 75, 63, 71, 48, 80, 65, 88, 17, 99, 45, 43]);
var keyBytes = Int8parse(key_Int); // 默认密钥
var pass_Int = new Int8Array([30, 30, 30, 30, 30, 30]);
var passBytes = Int8parse(pass_Int); // 默认密码

var serverKey = "32, 87, 47, 82, 54, 75, 63, 71, 48, 80, 65, 88, 17, 99, 45, 43";


//加密
function Encrypt(word) {
    try {
        console.log("需要加密的字符：" + word);
        var command = parseCommand(word);
        command = Int8parse(command);
        console.log("需要加密的byte：" + command);
        var en = CryptoJS.AES.encrypt(command, keyBytes, { mode: mode, padding: padding });
        console.log("加密后的base64" + en);
        var rb = en.ciphertext.toString().toUpperCase();
        console.log("加密后的字符" + rb);
        return rb;
    } catch (e) {
        console.log(e);
        return null;
    }
}

//解密
function Decrypt(word) {
    try {
        console.log("需要解密的字符：" + word);
        var encryptedHexStr = CryptoJS.enc.Hex.parse(word);
        var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        var decrypt = CryptoJS.AES.decrypt(srcs, keyBytes, { mode: mode, padding: padding });
        var rb = decrypt.toString();
        console.log("解密后的字符" + rb);
        return rb;
    } catch (e) {
        console.log(e);
        return null;
    }
}

//解析字符命令
function parseCommand(str) {
    var commandBytes = new Int8Array(20);
    var j = 0;
    for (var i = 0; i < 32; i += 2) {
        if (j < str.length) {
            commandBytes[j] = parseInt(str.substr(i, 2),16);
        } else {
            commandBytes[j] = 0;
        }
        j++;
    }
    return commandBytes;
}

//将十进制的命令解析成wordarray
function Int8parse(u8arr) {
    // Shortcut
    var len = u8arr.length;
    // Convert
    var words = [];
    for (var i = 0; i < len; i++) {
        words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
    }
    return CryptoJS.lib.WordArray.create(words, len);
}

//解析服务器上的key
function passServerKey(serverKey){
    var keyArray = serverKey.split(",");
    var keyBytes = new Int8Array(16);
    for (var i = 0; i < 16; i ++) {
       keyBytes[i] = keyArray[i];
    }
    return keyBytes;
}

//字符串开头是否是某一串字符
function startWiths(str,eqstr){
    if(str.substr(0,eqstr.length) == eqstr){
        return true;
    }
    return false;
}

module.exports = {
    en: Encrypt,
    de: Decrypt,
    startWiths:startWiths,
}