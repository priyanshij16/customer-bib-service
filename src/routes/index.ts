import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { countMetricsController } from '../controllers/countMetricsController'
import { PeopleMovement } from '../controllers/peopleMovementController'
import { peopleMovementValidator } from '../core/validators/peopleMovementValidator'
import { GenericApi } from '../controllers/GenericApiController'
import { customerCountValidator } from '../core/validators/customerCountValidator'
import { MigrationController } from '../controllers/MigrationController'

export default class MainRouter {
  router: Router
  peopleMovementController: PeopleMovement
  authController: AuthController
  countMetricsController:countMetricsController
  GenericApiController: GenericApi
  MigrationController: MigrationController
  constructor() {
    // Initialize controllers objects
    this.peopleMovementController = new PeopleMovement()
    this.authController = new AuthController()
    this.countMetricsController= new countMetricsController()
    this.GenericApiController = new GenericApi()
    this.MigrationController = new MigrationController()
    this.router = Router({ mergeParams: true })
    this.defaultRoutes()
  }

  defaultRoutes() {
    this.router.route('/test').get((req, res, next) => {
      res.send('Hello tester')
    })
    this.router
      .route('/api/v1/countMetrics')
      .get(
        this.countMetricsController.getCountMetrics
      )
    this.router
      .route('/api/v1/peopleFootfall')
      .post(
        peopleMovementValidator.makeValidation('key'),
        this.peopleMovementController.readDataForOrganisation,
      )

    this.router
      .route('/api/v1/peopleFootfall/:id')
      .post(
        peopleMovementValidator.makeValidation('param'),
        this.peopleMovementController.readDataForOrganisation,
      )

    this.router
      .route('/api/v1/generateToken')
      .post(
        peopleMovementValidator.makeValidation('auth'),
        this.authController.generateBase64Key,
      )

    this.router
      .route('/api/v1/customerPayments')
      .post(
        peopleMovementValidator.makeValidation('key'),
        this.GenericApiController.readDataForCustomerPayment,
      )

    this.router
      .route('/api/v1/customerPayments/:id')
      .post(
        peopleMovementValidator.makeValidation('param'),
        this.GenericApiController.readDataForCustomerPayment,
      )

    this.router
      .route('/api/v1/customerTransactions')
      .post(
        peopleMovementValidator.makeValidation('key'),
        this.GenericApiController.readDataForCustomerTransaction,
      )

    this.router
      .route('/api/v1/customerTransactions/:id')
      .post(
        peopleMovementValidator.makeValidation('param'),
        this.GenericApiController.readDataForCustomerTransaction,
      )

    this.router
      .route('/api/v1/customerCount')
      .get(
        customerCountValidator.makeValidation('index'),
        this.GenericApiController.readDataForCustomerCount,
      )

    this.router
      .route('/api/v1/customerMigrate')
      .post(
        customerCountValidator.makeValidation('param'),
        this.MigrationController.readDataForcustomerMigration,
      )
  }
}
