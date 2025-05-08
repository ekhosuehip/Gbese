import Notification from '../models/notificatinModel';

class NotifucationServices {
    async createNotification ({ userId, title, message, type }: {
        userId: string;
        title: string;
        message: string;
        type: 'debt_transfer' | 'debt_status' | 'payment' | 'fund_account';
            }) {
            return await Notification.create({
                user: userId,
                title,
                message,
                type
            });
        };

    async fetchNotification (user: string) {
        return await Notification.find({user}).sort({ createdAt: -1 });
    }
}

const notificationService = new NotifucationServices

export default notificationService


