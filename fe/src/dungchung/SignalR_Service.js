import * as signalR from '@microsoft/signalr';
import Enum from './enum';

const apiRoute = new Enum();
class SignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    // Khởi tạo connection
    async startConnection(userId) {
        try {
            const token = localStorage.getItem('token');
            
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(apiRoute.getUrl('signalr'), { // Thay đổi URL theo backend của bạn
                    accessTokenFactory: () => token,
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .withAutomaticReconnect([0, 2000, 10000, 30000]) // kết nối lại
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Bắt đầu connection
            await this.connection.start();
            this.isConnected = true;
            console.log('✅ SignalR Connected successfully');

            // Xử lý reconnection
            this.connection.onreconnected(() => {
                console.log('🔄 SignalR Reconnected');
                this.isConnected = true;
            });

            this.connection.onclose(() => {
                console.log('❌ SignalR Disconnected');
                this.isConnected = false;
            });

            return this.connection;
        } catch (error) {
            console.error('❌ SignalR Connection failed:', error);
            this.isConnected = false;
            throw error;
        }
    }

    // Đăng ký listener cho message
    onReceiveMessage(callback) {
        if (this.connection) {
            this.connection.on('ReceiveMessage', callback);
        }
    }

    // Hủy đăng ký listener
    offReceiveMessage() {
        if (this.connection) {
            this.connection.off('ReceiveMessage');
        }
    }

    // Dừng connection
    async stopConnection() {
        if (this.connection) {
            await this.connection.stop();
            this.isConnected = false;
            console.log('🛑 SignalR Connection stopped');
        }
    }

    // Kiểm tra trạng thái connection
    getConnectionState() {
        return this.connection ? this.connection.state : 'Disconnected';
    }
}

export default new SignalRService();