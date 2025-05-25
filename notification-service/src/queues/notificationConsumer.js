import amqp from "amqplib"
import { getIO } from "../sockets/socketInstance.js"
import { Notification } from "../models/notification.model.js"

export const consumeNotifications = async(req, res) => {
    const connection = await amqp.connect(process.env.RABBITMQ_URI)

    const channel = await connection.createChannel()

    const queue = 'notifications'

    await channel.assertQueue(queue, {
        durable: true
    })

    console.log("Waiting for messages in queue...")

    channel.consume(queue, async(msg) => {
        try {
            const payload = JSON.parse(msg.content.toString())

            const { userId, message, type, metadata } = payload

            const notification = await Notification.create({ userId, message, type, metadata })

            const io = getIO()
            io.to(userId).emit('newNotification', notification)

            channel.ack(msg)
            console.log(`Notification sent to user ${userId}`)
        } catch (error) {
            console.log("Error handling notification: ", error)
        }
    })
}