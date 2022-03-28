const { Telegraf } = require('telegraf')
const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('db.db')

const TOKEN = '5253507271:AAHc6PQz7bIS6avE_RN7DD9fnDj0M5frRiA'


function startHandler(ctx) {
    const chatId = ctx.chat.id

    if (!!chats.find(x => x === chatId)) {
        console.warn('Chat already added', chatId)
        return
    }

    db.run('INSERT INTO chats(chat_id) VALUES(?)', [chatId], (err) => {
        if(err) {
            return console.log(err.message)
        }
        console.log(`Row was added to the table: ${chatId}`)
    })

    console.log('Add chat with id', chatId)
    chats.push(chatId)

    ctx.reply(`Welcome from sendMessage, you chat id is ${chatId}`)
}

function sendAllSubscribers(msg) {
    if (!isStarted) return

    chats.forEach(cid => {
        bot.telegram.sendMessage(cid, msg)
    })
}


const bot = new Telegraf(TOKEN)
let isStarted = false
const chats = []

bot.start((ctx) => startHandler(ctx))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.hears('hi', (ctx) => ctx)

bot.launch().then(() => isStarted = true)


const app = express()

app.get('/', (request, response) => {
    response.send("<h2>Привет Express!</h2>")
})

app.get('/send', (request, response) => {
    const message = request.query.message
    sendAllSubscribers(message)
    response.sendStatus(200)
})

app.listen(3000)


db.run('CREATE TABLE IF NOT EXISTS chats (chat_id TEXT)', () => {
    db.each('SELECT chat_id FROM chats', function(err, row) {
        console.log(row.chat_id)
        chats.push(row.chat_id)
    })
})

