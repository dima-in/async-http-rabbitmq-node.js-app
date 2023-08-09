#!/usr/bin/env node
const express = require('express');  // Библиотека для создания и обработки веб-сервера и маршрутов
const bodyParser = require('body-parser'); // Библиотека для обработки данных в теле HTTP запросов
const app = express();  // Экземпляр приложения Express.js
const port  = 3000;  // Порт для входящих HTTP запросов

const amqp = require("amqplib");  // Библиотека для работы с протоколом AMQP, используемым RabbitMQ.



connect()
// Создаем соеденение с RabbitMQ
async function connect() {
    // Подключение  'body-parser' для парсинга JSON данных в теле HTTP запросов
    app.use(bodyParser.json());
    // Обработчик для HTTP POST запросов
    app.post('/process', async (req, res) => {
        //
        const data = req.body;
        console.log("message :" + data.message)

        const queue = "task_queue"
        try {
            // Создаем соединение с RabbitMQ
            const conn = await amqp.connect("amqp://guest:guest@localhost:5672");
            console.log('Cnnection created')

            // Создаем канал связи внутри соединения
            const channel = await conn.createChannel();
            console.log('channel created')

            // Объявляем очередь
            await channel.assertQueue(queue);
            console.log('queue created')

            // Отправляем данные в очередь
            await channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)))
            console.log("Message send to queue " + queue)

        }catch (err) {
            console.error("Error -> " + err)
        }
    });

    // Слушаем входящие HTTP запросы на указанном порту
    app.listen(port, () => {
        console.log("M1.js listening at //localhost:" + port)
    });

}


