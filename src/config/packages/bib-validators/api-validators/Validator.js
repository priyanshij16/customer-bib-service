'use strict'

const { validationResult } = require('express-validator')

class Validator {
    constructor (rules) {
        this.rules = rules
    }

    makeValidation (validatorKey = null) {
        try {
            if (!validatorKey) {
                throw new Error(`Invalid validator key '${validatorKey}' supplied.`)
            }

            this.rules[validatorKey]

            return [
                ...this.rules[validatorKey],
                (req, res, next) => {
                    const errors = validationResult(req)
                    if (!errors.isEmpty()) {
                        return res.status(400).send({
                            errors: errors.array()
                        })
                    }
                    next()
                }
            ]
        }
        catch (err) {
            return res.send(err)
        }
    }
}

module.exports = Validator