import dotenv from 'dotenv';

dotenv.config();

const defaultDatabaseUrl = 'mysql://root:@localhost:3306/erp';

process.env.DATABASE_URL ??= defaultDatabaseUrl;

export const config = {

    server: {
        port: Number(process.env.PORT ?? 3000),
    },

    database: {
        url: process.env.DATABASE_URL ?? defaultDatabaseUrl,
    },

    auth: {
        jwtSecret:
            process.env.JWT_SECRET ?? 'change_me',

        jwtExpiresIn:
            process.env.JWT_EXPIRES_IN ?? '1h',

        refreshTokenExpiresIn:
            process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
    },

    whatsapp: {

        provider:
            (process.env.WHATSAPP_PROVIDER as
                | 'waha'
                | 'meta-cloud'
                | 'baileys') ?? 'meta-cloud',

        apiKey:
            process.env.WAHA_API_KEY ?? '',

        endpoint:
            process.env.WAHA_ENDPOINT ?? '',

        accessToken:
            process.env.META_CLOUD_ACCESS_TOKEN ?? '',

        phoneNumberId:
            process.env.META_CLOUD_PHONE_NUMBER_ID ?? '',

        sessionId:
            process.env.BAILEYS_SESSION_ID ??
            'default-session',

        verifyToken:
            process.env.META_VERIFY_TOKEN ?? '',

        businessId:
            process.env.META_CLOUD_BUSINESS_ID ?? '',

        appId:
            process.env.META_APP_ID ?? '',

        appSecret:
            process.env.META_APP_SECRET ?? '',

        ownerNumber:
            process.env.BOT_OWNER_NUMBER?.trim() ?? '',

        tenantId:
            process.env.META_CLOUD_TENANT_ID?.trim() ?? '',
    },
};