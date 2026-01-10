import db from '../config/database';

export interface SystemConfiguration {
    id: number;
    app_name: string;
    company_logo_url: string | null;
    company_email: string | null;
    company_phone: string | null;
    company_address: string | null;
    storage_type: 'server' | 'firebase';
    firebase_api_key: string | null;
    firebase_auth_domain: string | null;
    firebase_project_id: string | null;
    firebase_storage_bucket: string | null;
    firebase_messaging_sender_id: string | null;
    firebase_app_id: string | null;
    auto_send_password: boolean;
    // SMTP Settings
    smtp_host: string | null;
    smtp_port: number | null;
    smtp_secure: boolean;
    smtp_user: string | null;
    smtp_password: string | null;
    smtp_from_name: string | null;
    smtp_from_email: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface SystemConfigurationUpdate {
    app_name?: string;
    company_logo_url?: string;
    company_email?: string;
    company_phone?: string;
    company_address?: string;
    storage_type?: 'server' | 'firebase';
    firebase_api_key?: string;
    firebase_auth_domain?: string;
    firebase_project_id?: string;
    firebase_storage_bucket?: string;
    firebase_messaging_sender_id?: string;
    firebase_app_id?: string;
    auto_send_password?: boolean;
    // SMTP Settings
    smtp_host?: string;
    smtp_port?: number;
    smtp_secure?: boolean;
    smtp_user?: string;
    smtp_password?: string;
    smtp_from_name?: string;
    smtp_from_email?: string;
}

class SystemConfigurationModel {
    static async get(): Promise<SystemConfiguration> {
        const query = `SELECT * FROM system_configuration WHERE id = 1;`;
        const result = await db.query(query);
        if (result.rows.length === 0) {
            // Create default configuration if it doesn't exist
            return await this.createDefault();
        }
        return result.rows[0];
    }

    static async createDefault(): Promise<SystemConfiguration> {
        const query = `
            INSERT INTO system_configuration (id, app_name, storage_type)
            VALUES (1, 'Asset Management System', 'server')
            RETURNING *;
        `;
        const result = await db.query(query);
        return result.rows[0];
    }

    static async update(configData: SystemConfigurationUpdate): Promise<SystemConfiguration> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        // Build dynamic update query
        Object.entries(configData).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            return await this.get();
        }

        // Add updated_at
        fields.push(`updated_at = now()`);

        const query = `
            UPDATE system_configuration 
            SET ${fields.join(', ')}
            WHERE id = 1
            RETURNING *;
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async getPublicConfig(): Promise<Partial<SystemConfiguration>> {
        const config = await this.get();
        // Return only public-facing configuration (exclude sensitive Firebase keys)
        return {
            id: config.id,
            app_name: config.app_name,
            company_logo_url: config.company_logo_url,
            company_email: config.company_email,
            company_phone: config.company_phone,
            company_address: config.company_address,
            storage_type: config.storage_type
        };
    }
}

export default SystemConfigurationModel;
