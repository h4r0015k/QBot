const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.js');
const conf = new config();
const bot = new TelegramBot(conf.token, {polling: true});
const fetch = require('node-fetch');

let ans, hint, game = 0;

// Generate hint based on answer.
const generateHint = (ans) => {

    let len = Math.round(ans.length / 2);

    for(let i = len; i > 0; i--) 
        ans = ans.replace(ans.charAt(Math.floor(Math.random() * ans.length)),"_");
    
    return ans;
};


// Fetch random question.
const getQuestion = () => {

    fetch("https://opentdb.com/api.php?amount=1&difficulty=medium")
    .then(response => response.json())
    .then(data => {

        const question = data.results[0].question;
        ans = data.results[0]["correct_answer"];
        game = 1;
        hint = generateHint(ans);
        
        bot.sendMessage(conf.bot, question);
    })
    .catch(err => {game = 0});
}


// new question after every x minutes.
setInterval(getQuestion, conf.interval * 60000);


// Allows users to submit their answers.
bot.onText(/!ans\s([a-zA-Z0-9\s-_*+!@#$%^&]*)/, (msg, match) => {
   
    if(msg.chat.id === conf.bot) {
        if(game) {
         
            const answer = match[1];
            const mem = msg.from.hasOwnProperty("username") ? "@" + msg.from.username : msg.from.first_name;

            if(answer.toLowerCase().trim() == ans.toLowerCase().trim()) {
            
                game = 0;
                bot.sendMessage(conf.bot, `${conf.response}`, {"reply_to_message_id": msg.message_id});
        
            }

        } else {
        
            bot.sendMessage(conf.bot, "Wait for next question!");
        }
    }
});

// Allows users to obtain hints.
bot.onText(/!hint/, (msg, match) => {

    if(msg.chat.id === conf.bot) {
        
        if(game) 
            bot.sendMessage(conf.bot, `Hint: ${hint}`, {"reply_to_message_id": msg.message_id});
        else
            bot.sendMessage(conf.bot, `Wait for next question!`, {"reply_to_message_id": msg.message_id});
    }
});
