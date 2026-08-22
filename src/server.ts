import 'dotenv/config'        // ← moved to line 1, replaces dotenv import + dotenv.config()
import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { AppDataSource } from './config/database'
import { errorMiddleware } from './middleware/error.middleware'
import router from './routes/index.routes'

// Validate required environment variables at startup
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_HOST', 'DB_NAME'];
const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  console.error('Please add them to your .env file. See .env.example for reference.');
  process.exit(1);
}

const app = express()

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000'

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}))
app.use(express.json())
app.use('/api/v1', router)
app.use(errorMiddleware)

const PORT = process.env.PORT || 5000

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected')
    app.listen(PORT, () =>
      console.log(`Server running on port http://localhost:${PORT}`)
    )
  })
  .catch((err) => console.error('DB connection failed:', err))

export default app
