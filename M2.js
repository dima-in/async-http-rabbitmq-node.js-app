#!/usr/bin/env node
const amqp = require("amqplib");  // Библиотека для работы с протоколом AMQP, используемым RabbitMQ.

connect()

// Создаем соеденение с RabbitMQ
async function connect() {
    const queue = "task_queue"
    const resultQueue = "result__queue"
    // Функция для обработки задания
    async function processTask(task) {
        task.status = "processed";
        return task;
    }

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

        console.log("Waiting for message")
            // Получение сообщения из RabbitMQ.
        await channel.consume(queue, async (msg) => {
            const task = msg.content
            console.log(" [x] Received " + task);

            // Обработка задания.
            const result = await processTask(task)
            console.log('result processing: ' + result )

            // Очередь для отправки обработанных заданий
            await channel.assertQueue(resultQueue);
            console.log('resultQueue created')

            // Помещение обработанного задания в очередь
            await channel.sendToQueue(resultQueue, Buffer.from(JSON.stringify(result)))
            console.log("Message send to queue " + queue)

        });
        // Закрываем соеденение.
        setTimeout(function() {
            conn.close();
            process.exit(0)
        }, 500);

    }catch (err) {
        console.error("Error -> " + err)
    }
}


