import { check, query } from 'express-validator'
import { Validator } from './Validator'
import { AuthController } from '../../controllers/AuthController'

class CustomerCountValidator extends Validator{
    constructor(){
        super({
            index: [
                check('orgId')
                .trim()
                .notEmpty()
                .withMessage("orgId should be Required"),

                check('eventType')
                .trim()
                .notEmpty()
                .withMessage("eventType should be Required")
                .isIn(['footfall', 'payments', 'transactions'])
                .withMessage(
                  `eventType should be 'footfall', 'payments' or 'transactions' only`,
                ),    
            ],
            param: [
              check('clientId')
                  .notEmpty()
                  .trim()
                  .withMessage('clientId is a required field'),
              check('eventType')
                  .notEmpty()
                  .trim()
                  .withMessage('eventType is a required field'),
              check('startDate')
                  .notEmpty()
                  .trim()
                  .withMessage('startDate is a required field'),
              check('endDate')
                  .notEmpty()
                  .trim()
                  .withMessage('endDate is a required field')
            ],
        })
    }
}

export let customerCountValidator = new CustomerCountValidator()

