import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // Avoid TypeScript error: Cannot redeclare block-scoped variable
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached && cached.conn) {
    return cached.conn;
  }

  if (cached && !cached.promise) {
    const opts = {
      bufferCommands: false,
    };

  cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => mongoose);
  }

  try {
    if (cached) {
      cached.conn = await cached.promise!;
    }
  } catch (e) {
    if (cached) cached.promise = null;
    throw e;
  }

  return cached?.conn;
}

export default dbConnect;