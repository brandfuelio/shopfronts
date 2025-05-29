"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const handlebars_1 = __importDefault(require("handlebars"));
class EmailService {
    static transporter;
    static templates = new Map();
    /**
     * Initialize email transporter
     */
    static async initialize() {
        try {
            // Create transporter based on environment
            if (env_1.env.NODE_ENV === 'production') {
                // Production: Use real SMTP service
                this.transporter = nodemailer_1.default.createTransport({
                    host: env_1.env.SMTP_HOST,
                    port: env_1.env.SMTP_PORT,
                    secure: env_1.env.SMTP_SECURE,
                    auth: {
                        user: env_1.env.SMTP_USER,
                        pass: env_1.env.SMTP_PASS,
                    },
                });
            }
            else {
                // Development: Use Ethereal Email for testing
                const testAccount = await nodemailer_1.default.createTestAccount();
                this.transporter = nodemailer_1.default.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass,
                    },
                });
            }
            // Verify connection
            await this.transporter.verify();
            logger_1.logger.info('Email service initialized successfully');
            // Load email templates
            await this.loadTemplates();
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize email service:', error);
            throw new errors_1.AppError('Email service initialization failed', 500);
        }
    }
    /**
     * Load email templates
     */
    static async loadTemplates() {
        const templatesDir = path_1.default.join(__dirname, '../../templates/emails');
        try {
            const files = await promises_1.default.readdir(templatesDir);
            for (const file of files) {
                if (file.endsWith('.hbs')) {
                    const templateName = file.replace('.hbs', '');
                    const templatePath = path_1.default.join(templatesDir, file);
                    const templateContent = await promises_1.default.readFile(templatePath, 'utf-8');
                    const compiledTemplate = handlebars_1.default.compile(templateContent);
                    this.templates.set(templateName, compiledTemplate);
                }
            }
            logger_1.logger.info(`Loaded ${this.templates.size} email templates`);
        }
        catch (error) {
            logger_1.logger.warn('Failed to load email templates:', error);
        }
    }
    /**
     * Send email
     */
    static async sendEmail(options) {
        try {
            if (!this.transporter) {
                await this.initialize();
            }
            let html = options.html;
            let text = options.text;
            // Use template if specified
            if (options.template && options.data) {
                const template = this.templates.get(options.template);
                if (template) {
                    html = template(options.data);
                    // Generate text version from HTML if not provided
                    if (!text) {
                        text = html.replace(/<[^>]*>/g, '');
                    }
                }
                else {
                    logger_1.logger.warn(`Email template '${options.template}' not found`);
                }
            }
            const mailOptions = {
                from: `${env_1.env.EMAIL_FROM_NAME} <${env_1.env.EMAIL_FROM}>`,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html,
                text,
                attachments: options.attachments,
            };
            const info = await this.transporter.sendMail(mailOptions);
            if (env_1.env.NODE_ENV !== 'production') {
                logger_1.logger.info('Preview URL:', nodemailer_1.default.getTestMessageUrl(info));
            }
            logger_1.logger.info('Email sent successfully:', {
                messageId: info.messageId,
                to: options.to,
                subject: options.subject,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send email:', error);
            throw new errors_1.AppError('Failed to send email', 500);
        }
    }
    /**
     * Send welcome email
     */
    static async sendWelcomeEmail(user) {
        await this.sendEmail({
            to: user.email,
            subject: 'Welcome to ShopFronts!',
            template: 'welcome',
            data: {
                name: user.name,
                loginUrl: `${env_1.env.FRONTEND_URL}/login`,
                supportEmail: env_1.env.SUPPORT_EMAIL,
            },
        });
    }
    /**
     * Send password reset email
     */
    static async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${env_1.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await this.sendEmail({
            to: user.email,
            subject: 'Reset Your Password',
            template: 'password-reset',
            data: {
                name: user.name,
                resetUrl,
                expiryTime: '1 hour',
                supportEmail: env_1.env.SUPPORT_EMAIL,
            },
        });
    }
    /**
     * Send email verification
     */
    static async sendEmailVerification(user, verifyToken) {
        const verifyUrl = `${env_1.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;
        await this.sendEmail({
            to: user.email,
            subject: 'Verify Your Email',
            template: 'email-verification',
            data: {
                name: user.name,
                verifyUrl,
                supportEmail: env_1.env.SUPPORT_EMAIL,
            },
        });
    }
    /**
     * Send order confirmation
     */
    static async sendOrderConfirmation(order) {
        await this.sendEmail({
            to: order.user.email,
            subject: `Order Confirmation #${order.orderNumber}`,
            template: 'order-confirmation',
            data: {
                name: order.user.name,
                orderNumber: order.orderNumber,
                items: order.items,
                total: order.total,
                orderUrl: `${env_1.env.FRONTEND_URL}/orders/${order.orderNumber}`,
                supportEmail: env_1.env.SUPPORT_EMAIL,
            },
        });
    }
    /**
     * Send payment receipt
     */
    static async sendPaymentReceipt(payment) {
        await this.sendEmail({
            to: payment.user.email,
            subject: 'Payment Receipt',
            template: 'payment-receipt',
            data: {
                name: payment.user.name,
                amount: payment.amount,
                currency: payment.currency.toUpperCase(),
                paymentMethod: payment.paymentMethod,
                receiptUrl: payment.receiptUrl,
                date: new Date().toLocaleDateString(),
                supportEmail: env_1.env.SUPPORT_EMAIL,
            },
        });
    }
    /**
     * Send seller notification
     */
    static async sendSellerNotification(seller, notification) {
        const subjects = {
            new_order: 'New Order Received!',
            new_review: 'New Product Review',
            product_approved: 'Product Approved',
            product_rejected: 'Product Review Required',
        };
        await this.sendEmail({
            to: seller.email,
            subject: subjects[notification.type],
            template: `seller-${notification.type.replace('_', '-')}`,
            data: {
                name: seller.name,
                ...notification.data,
                dashboardUrl: `${env_1.env.FRONTEND_URL}/seller/dashboard`,
                supportEmail: env_1.env.SUPPORT_EMAIL,
            },
        });
    }
    /**
     * Send bulk email (for newsletters, announcements)
     */
    static async sendBulkEmail(recipients, subject, content) {
        // Send in batches to avoid rate limits
        const batchSize = 50;
        const batches = [];
        for (let i = 0; i < recipients.length; i += batchSize) {
            batches.push(recipients.slice(i, i + batchSize));
        }
        for (const batch of batches) {
            await this.sendEmail({
                to: batch,
                subject,
                html: content,
            });
            // Add delay between batches
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map