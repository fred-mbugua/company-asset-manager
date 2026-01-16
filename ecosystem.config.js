module.exports = {
        apps: [{
                name: "asset-management-app-2",
                script: "dist/server.js",
                env: {
                        NODE_ENV: "production",
                        PORT: 5000,

                        DATABASE_URL: "postgresql://complianceadmin:compliance@25JSLICT!@localhost:5432/ict_asset_register_2",

                        JWT_ACCESS_SECRET: "assetmanagement_accesssecret",
                        JWT_REFRESH_SECRET: "assetmanagement_refreshsecret",
                        JWT_ACCESS_EXPIRATION: "15m",
                        JWT_REFRESH_EXPIRATION: "7d",

                        MAIL_SERVICE: "gmail",
                        MAIL_USER: "jiranismartlimitedfocus@gmail.com",
                        MAIL_PASS: "@JSL2024bckp",

                        SMS_API_KEY: "sms_provider_api_key",
                },
        }]
};