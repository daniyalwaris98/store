import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce"

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
  listenersSet?: boolean
  shutdownHandlerSet?: boolean
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null }

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

const connectionOptions = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 50,
}

async function connectWithRetry(retries = 3, delay = 1000): Promise<typeof mongoose> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(MONGODB_URI, connectionOptions)
      console.log(`MongoDB connected: ${conn.connection.host}`)
      return conn
    } catch (error) {
      if (attempt === retries) {
        console.error(`MongoDB connection failed after ${retries} attempts:`, error)
        throw error
      }
      const waitTime = delay * Math.pow(2, attempt - 1)
      console.warn(`MongoDB connection attempt ${attempt} failed, retrying in ${waitTime}ms...`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }
  throw new Error("Should not reach here")
}

// Auto-connect once on first import
if (!cached.promise) {
  cached.promise = connectWithRetry().then((m) => {
    cached.conn = m
    return m
  })
}

export async function connectDB() {
  if (cached.conn) return cached.conn
  return cached.promise
}

// Connection event listeners — set once via global to survive HMR
if (!global.mongooseCache?.listenersSet) {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connection established")
  })

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB connection lost")
  })

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err)
  })

  if (global.mongooseCache) {
    global.mongooseCache.listenersSet = true
  }
}

// Graceful shutdown — register handlers once
if (!global.mongooseCache?.shutdownHandlerSet) {
  function gracefulShutdown(signal: string) {
    console.log(`Received ${signal}, closing MongoDB connection...`)
    mongoose.connection.close().finally(() => {
      console.log("MongoDB connection closed")
      process.exit(0)
    })
  }

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
  process.on("SIGINT", () => gracefulShutdown("SIGINT"))

  if (global.mongooseCache) {
    global.mongooseCache.shutdownHandlerSet = true
  }
}

export { cached }

export default mongoose
