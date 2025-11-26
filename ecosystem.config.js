module.exports = {
        apps: [{
                name: "asset-management-app",
                script: "dist/server.js",
                env: {
                        NODE_ENV: "production",
                        PORT: 4000,

                        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/ict_asset_register",

                        JWT_ACCESS_SECRET: "assetmanagementaccesssecret",
                        JWT_REFRESH_SECRET: "assetmanagementrefreshsecret",
                        JWT_ACCESS_EXPIRATION: "15m",
                        JWT_REFRESH_EXPIRATION: "7d",

                        MAIL_SERVICE: "gmail",
                        MAIL_USER: "jiranismartlimitedfocus@gmail.com",
                        MAIL_PASS: "@JSL2024bckp",

                        SMS_API_KEY: "sms_provider_api_key",
                },
        }]
};