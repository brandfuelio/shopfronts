import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import path from 'path';
import fs from 'fs/promises';
import handlebars from 'handlebars';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  data?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

export class EmailService {
  private static transporter: nodemailer.Transporter;
  private static templates: Map<string, handlebars.TemplateDelegate> = new Map();

  /**
   * Initialize email transporter
   */
  static async initialize() {
    try {
      // Create transporter based on environment
      if (env.NODE_ENV === 'production') {
        // Production: Use real SMTP service
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
        });
      } else {
        // Development: Use Ethereal Email for testing
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
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
      logger.info('Email service initialized successfully');

      // Load email templates
      await this.loadTemplates();
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      throw new AppError('Email service initialization failed', 500);
    }
  }

  /**
   * Load email templates
   */
  private static async loadTemplates() {
    const templatesDir = path.join(__dirname, '../../templates/emails');
    
    try {
      const files = await fs.readdir(templatesDir);
      
      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '');
          const templatePath = path.join(templatesDir, file);
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          const compiledTemplate = handlebars.compile(templateContent);
          this.templates.set(templateName, compiledTemplate);
        }
      }
      
      logger.info(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      logger.warn('Failed to load email templates:', error);
    }
  }

  /**
   * Send email
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
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
        } else {
          logger.warn(`Email template '${options.template}' not found`);
        }
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html,
        text,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (env.NODE_ENV !== 'production') {
        logger.info('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      logger.info('Email sent successfully:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw new AppError('Failed to send email', 500);
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(user: { email: string; name: string }) {
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to ShopFronts!',
      template: 'welcome',
      data: {
        name: user.name,
        loginUrl: `${env.FRONTEND_URL}/login`,
        supportEmail: env.SUPPORT_EMAIL,
      },
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(user: { email: string; name: string }, resetToken: string) {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      template: 'password-reset',
      data: {
        name: user.name,
        resetUrl,
        expiryTime: '1 hour',
        supportEmail: env.SUPPORT_EMAIL,
      },
    });
  }

  /**
   * Send email verification
   */
  static async sendEmailVerification(user: { email: string; name: string }, verifyToken: string) {
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${verifyToken}`;
    
    await this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      template: 'email-verification',
      data: {
        name: user.name,
        verifyUrl,
        supportEmail: env.SUPPORT_EMAIL,
      },
    });
  }

  /**
   * Send order confirmation
   */
  static async sendOrderConfirmation(order: {
    user: { email: string; name: string };
    orderNumber: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
  }) {
    await this.sendEmail({
      to: order.user.email,
      subject: `Order Confirmation #${order.orderNumber}`,
      template: 'order-confirmation',
      data: {
        name: order.user.name,
        orderNumber: order.orderNumber,
        items: order.items,
        total: order.total,
        orderUrl: `${env.FRONTEND_URL}/orders/${order.orderNumber}`,
        supportEmail: env.SUPPORT_EMAIL,
      },
    });
  }

  /**
   * Send payment receipt
   */
  static async sendPaymentReceipt(payment: {
    user: { email: string; name: string };
    amount: number;
    currency: string;
    paymentMethod: string;
    receiptUrl?: string;
  }) {
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
        supportEmail: env.SUPPORT_EMAIL,
      },
    });
  }

  /**
   * Send seller notification
   */
  static async sendSellerNotification(seller: { email: string; name: string }, notification: {
    type: 'new_order' | 'new_review' | 'product_approved' | 'product_rejected';
    data: Record<string, any>;
  }) {
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
        dashboardUrl: `${env.FRONTEND_URL}/seller/dashboard`,
        supportEmail: env.SUPPORT_EMAIL,
      },
    });
  }

  /**
   * Send bulk email (for newsletters, announcements)
   */
  static async sendBulkEmail(recipients: string[], subject: string, content: string) {
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