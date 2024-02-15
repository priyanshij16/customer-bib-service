import path from 'path'
export const ROOT_DIR = path.join(__dirname, '../../../')
export const defaultLimit = 100
export const maxGenericApiHits = 300
export const maxTrasactionDataLimit = 10000
export const maxFootfallDataLimit = 10000
export const defaultPage = 1
export const KEY = 'customer-service'
export const SERVICE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTUzMjc2MzIsImlhdCI6MTY2MDYzMzIzMn0.SLPk86TJrGt4Q9zmnCnxKqGcG9JTFZMYEDxiyY0ajyQ'

export const WHITELIST_IPS = [
  '127.0.0.1',
  '::1',
  '136.232.147.18',
  '130.65.109.250',
  '81.152.114.11',
  '81.157.218.199',
  '81.152.107.187',
  '115.241.31.195',
  '139.5.18.82',
  '43.240.6.71',
  '13.50.5.106',
  '10.0.2.153',
  '10.0.2.161',
  '10.0.9.27',
  '31.48.87.205'
]
export const MIGRATION_EXCHANGE = 'migration_exchange'
export const MIGRATION_ROUTING_KEY = 'migration'
export const migrationPath = {
  lcd_to_rmq: "lcd_to_rmq",
  rmq_to_link:"rmq_to_link"
}
export let uniqueConstraintError = "UniqueConstraintError"
export let validationError = "Validation error"