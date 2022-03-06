const TelegramApi = require('node-telegram-bot-api')
const {game_options, again_options} = require('./options')
const commands = require("./commands")

const token = '5239152130:AAFYRag7QpeWIqkNebBrClJHHjFToVSb2Ks'

const bot = new TelegramApi(token, {polling: true})

const chats = {}

const start_game = async (chat_id) => {
    await bot.sendMessage(chat_id, `Давай поиграем! Я загадываю число, а ты его отгадывай`)
    const rnd_num = Math.floor(Math.random() * 10)
    chats[chat_id] = rnd_num
    console.log(chats[chat_id])
    await bot.sendMessage(chat_id, 'Придумал! Отгадывай', game_options)
}

const start = () => {

    bot.setMyCommands(commands)

    bot.on('message', async msg => {
        const text = msg.text
        const chat_id = msg.chat.id

        switch (text) {
            case '/start':
                await bot.sendSticker(chat_id, "https://tlgrm.ru/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/1.webp")
                return bot.sendMessage(chat_id, `Добро пожаловать! Меня зовут Lonely, я буду тебе помогать!`)
            case '/info':
                return bot.sendMessage(chat_id, `Я знаю что тебе зовут  ${msg.from.first_name}! Рад знакомству!`)
            case '/game':
                return start_game(chat_id)
            default:
                return bot.sendMessage(chat_id, 'Я еще плохо знаю человеческий и не особо тебя понял..')
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chat_id = msg.message.chat.id
        switch (data) {
            case `${chats[chat_id]}`:
                return bot.sendMessage(chat_id, `Поздравляю!!! Ты отгадал мое число - ${chats[chat_id]}`, again_options)
            case '/again':
                return start_game(chat_id)
            default:
                return bot.sendMessage(chat_id, `Не угадал, я загадал число ${chats[chat_id]}`, again_options)
        }
    })
}

start()
