import dns from 'node:dns';
import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export async function connectDB(uri = config.mongodbUri) {
  if (isConnected) {
    return mongoose.connection;
  }

  if (config.dnsServers.length) {
    dns.setServers(config.dnsServers);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`MongoDB connected successfully (${conn.connection.host})`);

    mongoose.connection.on('error', (err) => {
      isConnected = false;
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('MongoDB disconnected');
    });

    return conn.connection;
  } catch (error) {
    isConnected = false;
    console.error(`MongoDB connection failed: ${error.message}`);
    // Do not terminate process immediately so the health endpoint can still report degraded status
    return null;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
