import { Request, Response } from 'express';
import { logger } from '../utils/logger';
var resHndlr = require("../config/packages/bib-response-handler/resHandler");
var message = require("../config/packages/bib-response-handler/messages");
var constant = require("../config/packages/bib-response-handler/constants");

export class BaseController {
    public baseModel: any

    constructor(public models?: any) {
        this.baseModel = models
    }
    
    public async readAll (req: Request, res: Response,query:any={}) {   
        this.baseModel.findAndCountAll(query)
            .then((eventRange: any) => {
                resHndlr.sendSuccessWithMsg(res, eventRange);
            })
            .catch((err: any) => {
                resHndlr.sendError(res, err);
            });
    }

    read=(req: Request, res: Response)=>{
        this.baseModel.findByPk(req.params.id)
            .then((eventRange:any) => {
                
                if (eventRange) {
                    logger.info(eventRange.dataValues)
                    resHndlr.sendSuccessWithMsg(res, eventRange);
                } else {
                    throw new Error();
                }
            })
            .catch((err: any) => {
                err.errorType = constant.ERROR_TYPE.NOT_FOUND
                err.message = message.notFound
                resHndlr.sendError(res, err);
            });
    }

  create=(req: Request, res: Response)=>{    
        this.baseModel.create(req.body)
            .then((eventRange: any) => {
                logger.info(eventRange.dataValues)
                resHndlr.sendSuccess(
                    res,
                    eventRange,
                    constant.RESPONSE_STATUS.SUCCESS_CREATED,
                  )
            })
            .catch((err: any) => {
                logger.error("err",err); 
                resHndlr.sendError(res, err);
            });
    }

    update=(req: Request, res: Response)=>{
        this.baseModel.update(req.body, {
            fields: Object.keys(req.body),
            where: { id: req.params.id }
        }).then((affectedRows: [number, any]) => {
            if (affectedRows[0]) {
            resHndlr.sendSuccess(res, affectedRows);
            }else{
                throw new Error();
            }
        }).catch((err: any) => {
            err.errorType = constant.ERROR_TYPE.NOT_FOUND
            err.message = message.notFound
            resHndlr.sendError(res, err);
        })
    }

    delete=(req: Request, res: Response) => {
        this.baseModel.destroy({
            where: { id: req.params.id }
        })
            .then((removedRows: number) => {
                if (removedRows) {
                    resHndlr.sendSuccess(res, removedRows);
                }else{
                    throw new Error();
                }
            }).catch((err: any) => {
                err.errorType = constant.ERROR_TYPE.NOT_FOUND
                err.message = message.notFound
                resHndlr.sendError(res, err);
            })
    }
}