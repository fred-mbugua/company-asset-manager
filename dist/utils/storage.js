"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const writeFileAsync = (0, util_1.promisify)(fs.writeFile);
const unlinkAsync = (0, util_1.promisify)(fs.unlink);
const mkdirAsync = (0, util_1.promisify)(fs.mkdir);
class StorageService {
    constructor() {
        this.firebaseInitialized = false;
        this.firebaseStorage = null;
        this.uploadsDir = path.join(process.cwd(), 'uploads');
        this.ensureUploadDirectories();
    }
    async ensureUploadDirectories() {
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
    async initializeFirebase(config) {
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
            const { initializeApp, getApps } = await Promise.resolve().then(() => __importStar(require('firebase/app')));
            const { getStorage } = await Promise.resolve().then(() => __importStar(require('firebase/storage')));
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
            }
            else {
                const { getApp } = await Promise.resolve().then(() => __importStar(require('firebase/app')));
                this.firebaseStorage = getStorage(getApp());
            }
            this.firebaseInitialized = true;
        }
        catch (error) {
            console.error('Failed to initialize Firebase:', error);
            throw new Error('Firebase initialization failed');
        }
    }
    async uploadToServer(file, category) {
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
    async uploadToFirebase(file, category, firebaseConfig) {
        await this.initializeFirebase(firebaseConfig);
        if (!this.firebaseStorage) {
            throw new Error('Firebase storage not initialized');
        }
        try {
            const { ref, uploadBytes, getDownloadURL } = await Promise.resolve().then(() => __importStar(require('firebase/storage')));
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
        }
        catch (error) {
            console.error('Firebase upload error:', error);
            throw new Error('Failed to upload to Firebase');
        }
    }
    async deleteFromServer(filePath) {
        try {
            const fullPath = path.join(process.cwd(), filePath);
            console.log('Deleting from server:', fullPath);
            if (fs.existsSync(fullPath)) {
                await unlinkAsync(fullPath);
            }
            else {
                console.log('File does not exist:', fullPath);
            }
        }
        catch (error) {
            console.error('Server delete error:', error);
            throw new Error('Failed to delete file from server');
        }
    }
    async deleteFromFirebase(filePath, firebaseConfig) {
        await this.initializeFirebase(firebaseConfig);
        if (!this.firebaseStorage) {
            throw new Error('Firebase storage not initialized');
        }
        try {
            const { ref, deleteObject } = await Promise.resolve().then(() => __importStar(require('firebase/storage')));
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
        }
        catch (error) {
            console.error('Firebase delete error:', error);
            throw new Error('Failed to delete from Firebase');
        }
    }
    async upload(file, category, config) {
        if (config.type === 'firebase' && config.firebaseConfig) {
            return await this.uploadToFirebase(file, category, config.firebaseConfig);
        }
        else {
            return await this.uploadToServer(file, category);
        }
    }
    async delete(filePath, storageType, firebaseConfig) {
        // console.log('Delete called with:', { filePath, storageType });
        if (storageType === 'firebase') {
            if (!firebaseConfig) {
                throw new Error('Firebase config required for firebase storage deletion');
            }
            await this.deleteFromFirebase(filePath, firebaseConfig);
        }
        else {
            await this.deleteFromServer(filePath);
        }
    }
}
exports.default = new StorageService();
