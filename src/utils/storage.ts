import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

export interface StorageConfig {
    type: 'server' | 'firebase';
    firebaseConfig?: {
        apiKey: string | null;
        authDomain: string | null;
        projectId: string | null;
        storageBucket: string | null;
        messagingSenderId: string | null;
        appId: string | null;
    };
}

export interface UploadResult {
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    storageType: 'server' | 'firebase';
}

class StorageService {
    private uploadsDir: string;
    private firebaseInitialized: boolean = false;
    private firebaseStorage: any = null;

    constructor() {
        this.uploadsDir = path.join(process.cwd(), 'uploads');
        this.ensureUploadDirectories();
    }

    private async ensureUploadDirectories() {
        const directories = [
            this.uploadsDir,
            path.join(this.uploadsDir, 'assets'),
            path.join(this.uploadsDir, 'expenses'),
            path.join(this.uploadsDir, 'assignments'),
            path.join(this.uploadsDir, 'logos'),
            path.join(this.uploadsDir, 'repair-requests')
        ];

        for (const dir of directories) {
            if (!fs.existsSync(dir)) {
                await mkdirAsync(dir, { recursive: true });
            }
        }
    }

    private async initializeFirebase(config: StorageConfig['firebaseConfig']) {
        if (this.firebaseInitialized || !config) {
            return;
        }

        // Validate all required fields are present
        if (!config.apiKey || !config.authDomain || !config.projectId || 
            !config.storageBucket || !config.messagingSenderId || !config.appId) {
            throw new Error('Firebase configuration is incomplete');
        }

        try {
            // Dynamically import Firebase modules
            const { initializeApp, getApps } = await import('firebase/app');
            const { getStorage } = await import('firebase/storage');

            // Check if already initialized
            if (getApps().length === 0) {
                const firebaseApp = initializeApp({
                    apiKey: config.apiKey,
                    authDomain: config.authDomain,
                    projectId: config.projectId,
                    storageBucket: config.storageBucket,
                    messagingSenderId: config.messagingSenderId,
                    appId: config.appId
                });
                this.firebaseStorage = getStorage(firebaseApp);
            } else {
                const { getApp } = await import('firebase/app');
                this.firebaseStorage = getStorage(getApp());
            }

            this.firebaseInitialized = true;
        } catch (error) {
            console.error('Failed to initialize Firebase:', error);
            throw new Error('Firebase initialization failed');
        }
    }

    async uploadToServer(
        file: Express.Multer.File,
        category: 'assets' | 'expenses' | 'assignments' | 'logos' | 'repair-requests'
    ): Promise<UploadResult> {
        const uploadPath = path.join(this.uploadsDir, category);
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.originalname}`;
        const filePath = path.join(uploadPath, fileName);

        await writeFileAsync(filePath, file.buffer);

        return {
            fileName: file.originalname,
            filePath: `/uploads/${category}/${fileName}`,
            fileSize: file.size,
            fileType: file.mimetype,
            storageType: 'server'
        };
    }

    async uploadToFirebase(
        file: Express.Multer.File,
        category: 'assets' | 'expenses' | 'assignments' | 'logos' | 'repair-requests',
        firebaseConfig: StorageConfig['firebaseConfig']
    ): Promise<UploadResult> {
        await this.initializeFirebase(firebaseConfig);

        if (!this.firebaseStorage) {
            throw new Error('Firebase storage not initialized');
        }

        try {
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            
            const timestamp = Date.now();
            const fileName = `${timestamp}-${file.originalname}`;
            const storagePath = `${category}/${fileName}`;
            
            const storageRef = ref(this.firebaseStorage, storagePath);
            const snapshot = await uploadBytes(storageRef, file.buffer, {
                contentType: file.mimetype
            });

            const downloadURL = await getDownloadURL(snapshot.ref);

            return {
                fileName: file.originalname,
                filePath: downloadURL,
                fileSize: file.size,
                fileType: file.mimetype,
                storageType: 'firebase'
            };
        } catch (error) {
            console.error('Firebase upload error:', error);
            throw new Error('Failed to upload to Firebase');
        }
    }

    async deleteFromServer(filePath: string): Promise<void> {
        try {
            const fullPath = path.join(process.cwd(), filePath);
            console.log('Deleting from server:', fullPath);
            if (fs.existsSync(fullPath)) {
                await unlinkAsync(fullPath);
            } else {
                console.log('File does not exist:', fullPath);
            }
        } catch (error) {
            console.error('Server delete error:', error);
            throw new Error('Failed to delete file from server');
        }
    }

    async deleteFromFirebase(
        filePath: string,
        firebaseConfig: StorageConfig['firebaseConfig']
    ): Promise<void> {
        await this.initializeFirebase(firebaseConfig);

        if (!this.firebaseStorage) {
            throw new Error('Firebase storage not initialized');
        }

        try {
            const { ref, deleteObject } = await import('firebase/storage');
            
            // Extract the actual file path from the Firebase URL
            let actualPath = filePath;
            if (filePath.includes('firebasestorage.googleapis.com')) {
                // Extract path from URL like: https://...app/o/assignments%2Ffile.pdf?alt=media...
                const matches = filePath.match(/\/o\/(.+?)\?/);
                if (matches && matches[1]) {
                    actualPath = decodeURIComponent(matches[1]);
                }
            }
            
            console.log('Deleting from Firebase with path:', actualPath);
            const storageRef = ref(this.firebaseStorage, actualPath);
            await deleteObject(storageRef);
        } catch (error) {
            console.error('Firebase delete error:', error);
            throw new Error('Failed to delete from Firebase');
        }
    }

    async upload(
        file: Express.Multer.File,
        category: 'assets' | 'expenses' | 'assignments' | 'logos' | 'repair-requests',
        config: StorageConfig
    ): Promise<UploadResult> {
        if (config.type === 'firebase' && config.firebaseConfig) {
            return await this.uploadToFirebase(file, category, config.firebaseConfig);
        } else {
            return await this.uploadToServer(file, category);
        }
    }

    async delete(
        filePath: string,
        storageType: 'server' | 'firebase',
        firebaseConfig?: StorageConfig['firebaseConfig']
    ): Promise<void> {
        // console.log('Delete called with:', { filePath, storageType });
        
        if (storageType === 'firebase') {
            if (!firebaseConfig) {
                throw new Error('Firebase config required for firebase storage deletion');
            }
            await this.deleteFromFirebase(filePath, firebaseConfig);
        } else {
            await this.deleteFromServer(filePath);
        }
    }
}

export default new StorageService();
