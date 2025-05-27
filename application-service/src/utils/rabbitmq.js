import amqp from "amqplib"

let channel

const queue = "notifications"

export const connectRabbitMQ = async() => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URI)

        channel = await connection.createChannel()

        await channel.assertQueue(queue, {
            durable: true
        })
        console.log("Application Service connected to RabbitMQ")
    } catch (error) {
        console.log("Failed to connect to RabbitMQ:", error)
    }
}

export const publishToQueue = async (message) => {
    try {
        if (!channel) {
            console.log("RabbitMQ channel is not initialized")
            return
        }
        
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true,
        })
        console.log("Message published to queue")
    } catch (error) {
        console.log("Failed to publish message:", error)
    }
}