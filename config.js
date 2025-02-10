const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    SESSION_ID: process.env.SESSION_ID || "ezgjgYqQ#6ZZ2Nq5hxZN2sWrn9Nzl5heHPNnN1FrG0Rc-64020kw",
    ALIVE_IMG: process.env.ALIVE_IMG || "https://i.ibb.co/hXXQjMh/b5a6c8f52e0a71c3.jpg",
    ALIVE_MSG: process.env.ALIVE_MSG || "Hello User,I'm 𝕍𝕆ℝ𝕋𝔼𝕏 𝕄𝔻 Created by Pansilu Nethmina.I'm Alive 😊😊",
};
