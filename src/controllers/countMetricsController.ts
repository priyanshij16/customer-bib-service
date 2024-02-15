import client from 'prom-client'
import { Request, Response } from 'express'
export class countMetricsController {


    getCountMetrics = async (req: Request, res: Response) => {
        res.set('Content-Type', client.register.contentType)
        res.end(await client.register.metrics())
    }
}