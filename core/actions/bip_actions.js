import R from 'ramda'
import Fantasy from 'ramda-fantasy'
import models from '../models'
import pubsub from '../pubsub'
import logger from '../logger'
const Future = Fantasy.Future

/* function forwardBip ({ app, payloadData, bip, socket, currentActionChain }) {
  return new Future((rej, res) => {
    const actionName = `${currentActionChain.app_name}_${currentActionChain.action_name}`
    logger.log('action name created! ', actionName)
    return res(actionName)
  })
} */

function buildActionsFuture({ actionChain }) {
  return new Future((rej, res) => {
    // TODO: Make sure to ignore index 0 action chain

  })
}

function forwardAllBips ({ app, data, bips, socket }) {
  return new Future((rej, res) => {
    const getBipsResults = R.map((bip) => {
      const actionChain = JSON.parse(bip.get('action_chain')) // TODO: Implement try catch
      // 1. Get action chain
      // 2. parse json
      // 3. loop action chains and create list of futures
      R.compose(
        bip => JSON.parse(bip),
        bip => bip.get('action_chain')
      )
    })
    getBipsResults(bips)
  })
}

function checkIncomingActionBipCondition ({
  appName, actionName, incomingAction, condName, condTestCase, condRequiredFields, data, socket
}) {
  return new Future((rej, res) => {
    const checkIncActionMessageName = `${appName}_${actionName}_${condName}`
    // TODO: Refactor below
    // Basically it builds a result object that contains props extracted from data
    const buildPayloadData = (data, requiredFields) => {
      let result = {}
      R.map(field => {
        const currentData = R.propOr(undefined, field)(data)
        result = R.assoc(field, currentData, result)
      })(requiredFields)
      return result
    }
    const payload = {
      data: buildPayloadData(data, condRequiredFields),
      testCase: condTestCase
    }
    // TODO: extract props from data using cond required fields
    logger.log('checking bip condition, looking at data ')
    pubsub.publish({
      action: checkIncActionMessageName,
      data: payload,
      socket
    }).then((result) => {
      logger.info('condition test received a result! ', result)
      return res(result)
    })
    .catch((error) => {
      logger.error('condition test received an error! ', error)
      return rej(error)
    })
  })
}

/**
 * Filter and retrieve checked bips only
 * @param app
 * @param data
 * @param bips
 * @param socket
 * @param conditionCheckArgs
 * @returns {*}
 */
function getIncActionConditionCheckedBips ({ app, data, bips, socket, conditionCheckArgs }) {
  return new Future((rej, res) => {
    const checkBipsConditions = R.traverse(Future.of, checkIncomingActionBipCondition, conditionCheckArgs)
    checkBipsConditions.fork((err) => {
      logger.error('error while checking conditions  ', err)
      return rej(err)
    }, (resultArray) => {
      // resultArray = [true, false, true] : contains results of bips condition check
      const filterIndexed = R.addIndex(R.filter)
      const filterBips = filterIndexed((bip, idx) => resultArray[idx])
      return res({
        app,
        data,
        bips: filterBips(bips),
        socket
      })
    })
  })
}
// TODO: Check if current bip can pass condition check
function getBipsCheckIncActionConditionArgs ({ app, data, incomingAction, bips, socket }) {
  return new Future((rej, res) => {
    const getBipCheckArgs = R.map((bip) => {
      const getConds = R.compose(
        conds => JSON.parse(conds),
        bip => R.prop('incoming_action_condition_names')(bip)
      )
      const constructArgs = R.map(cond => ({
        appName: app.get('name'),
        actionName: R.prop('incoming_action_name', bip),
        condName: R.prop('name', cond),
        // Required field is used to extract correct props from data
        // TODO: See if you can use incomingAction's required_fields
        condRequiredFields: R.prop('required_fields', cond),
        condTestCase: R.prop('testCase', cond),
        incomingAction,
        data,
        socket
      }))
      return R.compose(
        constructArgs,
        getConds
      )(bip)
    })
    const getSpreadBipCheckArgs = R.compose(
      jsonBips => getBipCheckArgs(jsonBips)[0], // Unwraps a layer of array
      bips => bips.toJSON()
    )
    return res({ app, data, bips, socket, conditionCheckArgs: getSpreadBipCheckArgs(bips) })
  })
}

function getBips ({ app, data, incomingAction, socket }) {
  return new Future((rej, res) => {
    models.Bip
      .findAll({ incoming_action_name: incomingAction.get('name'), incoming_app_name: app.get('name') })
      .then(bips => {
        if (bips) {
          return res({ app, data, bips, incomingAction, socket })
        }
        return rej(undefined)
      })
  })
}

function getIncActionsFromApp ({ app, payload, socket }) {
  return new Future((rej, res) => {
    const { meta, data } = payload
    const incActionName = meta.name
    const relatedActions = app.related('actions')
      .where({
        name: incActionName,
        app_id: app.get('id'),
        type: 'incomingActions'
      })
    if (relatedActions) {
      return res({
        app,
        data,
        incomingAction: R.head(relatedActions),
        socket
      })
    }
    return rej(undefined)
  })
}

function getAppByName ({ appName, payload, socket }) {
  return new Future((rej, res) => {
    models.App.findOne({name: appName}, {withRelated: [
      'actions',
      'actions.actionFields',
      'actions.actionOptions',
      'actions.actionConditions'
    ]})
      .then(app => {
        if (app) {
          return res({ app, payload, socket })
        }
        return rej(undefined)
      })
  })
}

/**
 * Base bip action that reacts to incoming event and forward it to outgoing action
 * @param appName
 * @param payload
 * @param socket
 * @returns {Promise.<void>}
 */
function bip (appName, payload, socket) {
  const getApp = R.compose(
    R.chain(forwardAllBips),                     // Fowarding bips
    R.chain(getIncActionConditionCheckedBips),   // Incoming action
    R.chain(getBipsCheckIncActionConditionArgs), // Incoming action
    R.chain(getBips),
    R.chain(getIncActionsFromApp),
    getAppByName
  )
  getApp({ appName, payload, socket }).fork(logger.error, logger.log)
}

export default {
  bip
}
