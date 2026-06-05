import 'dotenv/config'        // ← moved to line 1, replaces dotenv import + dotenv.config()
import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { AppDataSource } from './config/database'
import { errorMiddleware } from './middleware/error.middleware'
import router from './routes/index.routes'

const app = express()

app.use(cors())
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