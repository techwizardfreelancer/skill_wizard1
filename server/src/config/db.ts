import mongoose from 'mongoose';

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: false,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
}
