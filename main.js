const TelegramApi = require('node-telegram-bot-api')
const {game_options, again_options} = require('./options')
const commands = require("./commands")
const sequelize = require('./db')
const UserModel = require('./models')

const token = '5239152130:AAFYRag7QpeWIqkNebBrClJHHjFToVSb2Ks'

const bot = new TelegramApi(token, {polling: true})

const chats = {}

const start_game = async (chat_id) => {
    await bot.sendMessage(chat_id, `Давай поиграем! Я загадываю число от 0 до 9, а ты его отгадывай`)
    const rnd_num = Math.floor(Math.random() * 10)
    chats[chat_id] = rnd_num
    console.log(chats[chat_id])
    await bot.sendMessage(chat_id, 'Придумал! Отгадывай', game_options)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('Подключение к бд сломалось', e)
    }

    bot.setMyCommands(commands)

    bot.on('message', async msg => {
        const text = msg.text
        const chat_id = msg.chat.id
        console.log(msg)
        try {
            switch (text) {
                case '/start':
                    await UserModel.create({chat_id})
                    await bot.sendSticker(chat_id, "https://tlgrm.ru/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/1.webp")
                    return bot.sendMessage(chat_id, `Добро пожаловать! Меня зовут Lonely, я буду тебе помогать!`)
                case '/info':
                    const user = await UserModel.findOne({chat_id})
                    return bot.sendMessage(chat_id, `Я знаю что тебе зовут  ${msg.from.first_name}! Рад знакомству!\nВ игре у тебя ${user.right} правильных ответов и ${user.wrong} неправильных`)
                case '/game':
                    return start_game(chat_id)
                default:
                    return bot.sendMessage(chat_id, `Я еще учусь, но по моему ты сказал ${text}`)
            }
        } catch (error) {
            return bot.sendMessage(chat_id, 'Мы уже здоровались)');
        }

    })

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chat_id = msg.message.chat.id
        const user = await UserModel.findOne({chat_id})
        switch (data) {
            case `${chats[chat_id]}`:
                user.right += 1
                await bot.sendMessage(chat_id, `Поздравляю!!! Ты отгадал мое число - ${chats[chat_id]}`, again_options)
                return user.save()
            case '/again':
                return  start_game(chat_id)
            default:
                user.wrong += 1
                await bot.sendMessage(chat_id, `Не угадал, я загадал число ${chats[chat_id]}`, again_options)
                return user.save()

        }

    })
}

start()
