import { Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import { KEY } from '../core/constants/constant'
import { sendError, sendSuccess } from '../utils/Helpers/resHandler'

export class AuthController {
  private key: string
  constructor() {
    this.key = process.env.SECRET_KEY || KEY
    this.generateToken = this.generateToken.bind(this)
    this.generateBase64Key = this.generateBase64Key.bind(this)
  }

  generateToken(req: Request, res: Response) {
    try {
      let { clientId, expiresIn } = req.body
      let options: any = {
        algorithm: 'HS256',
      }

      if (expiresIn) options.expiresIn = expiresIn

      let token = sign({ clientId }, this.key, options)

      sendSuccess(res, token)
    } catch (error) {
      sendError(res, error)
    }
  }

  generateBase64Key(req: Request, res: Response) {
    try {
      let { clientId } = req.body

      let key = AuthController.encodeBase64(clientId)

      sendSuccess(res, key)
    } catch (error) {
      sendError(res, error)
    }
  }

  static encodeBase64(text: string) {
    return Buffer.from(text).toString('base64')
  }

  static decodeBase64(data: string) {
    return Buffer.from(data, 'base64').toString('ascii')
  }
}
