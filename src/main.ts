import 'reflect-metadata';
import { createHmac } from 'crypto';
import axios from 'axios';
import { config } from './config/environment';
import { createApp } from './app';
import { prismaService } from './database/prisma.service';
import { seedService } from './apps/api/seed/seed.service';
import dotenv from "dotenv";

dotenv.config();

const ensureWhatsAppSubscription = async (): Promise<void> => {
  if (!config.whatsapp.businessId || !config.whatsapp.accessToken) {
    console.warn('⚠️ Skipping WhatsApp subscription: META_CLOUD_BUSINESS_ID or META_CLOUD_ACCESS_TOKEN tidak dikonfigurasi.');
    return;
  }

  const url = `https://graph.facebook.com/v23.0/${config.whatsapp.businessId}/subscribed_apps`;
  const params: Record<string, string> = {
    access_token: config.whatsapp.accessToken,
  };

  if (config.whatsapp.appSecret) {
    params.appsecret_proof = createHmac('sha256', config.whatsapp.appSecret)
      .update(config.whatsapp.accessToken)
      .digest('hex');
  }

  try {
    const response = await axios.post(url, null, { params });
    console.log('✅ WhatsApp Business Account subscribed to app:', response.data);
  } catch (error: any) {
    const data = error.response?.data ?? error.message;
    if (typeof data === 'object' && data.error?.message?.toLowerCase().includes('already')) {
      console.log('✅ WhatsApp Business Account sudah berlangganan ke aplikasi.');
      return;
    }
    console.warn('❌ Gagal memastikan subscription WhatsApp Business Account:', JSON.stringify(data, null, 2));
  }
};

const start = async () => {
  try {
    await prismaService.connect();
    await seedService.initialize();
  } catch (err) {
    console.error('Database initialization failed, continuing without DB:', err instanceof Error ? err.message : err);
  }

  await ensureWhatsAppSubscription();

  const app = createApp();
  const port = config.server.port;

  app.listen(port, () => {
    console.log(`Enterprise ERP platform listening on port ${port}`);
  });
};

start().catch((error) => {
  if (error instanceof Error) {
    console.error('Startup failed:', error.stack ?? error.message);
  } else {
    try {
      console.error('Startup failed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } catch {
      console.error('Startup failed:', error);
    }
  }
  process.exit(1);
});
