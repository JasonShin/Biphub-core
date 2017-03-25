import { Router } from 'express'
import config from '../../config'
import models from '../../models'
import bips from './bips'

export default () => {
  const api = Router()

	/**
	 * Bips route
	 */
  api.get('/bips', bips.getBip)
  api.post('/bips', bips.postBip)

	/**
   * Retrieves all apps
   * /apps
	 */
  api.get('/apps', (req, res) => {
    models.App.listAll().then((result) => {
      res.json({ result })
    })
  })

	/**
   * Retreives index info of api
	 */
  api.get('/', (req, res) => {
    const result = config.get('api')
    res.json({ result })
  })
  return api
}
