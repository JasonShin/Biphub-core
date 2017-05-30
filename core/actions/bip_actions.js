import R from 'ramda'
import models from '../models'
import pubsub from '../pubsub'

/**
 * Base bip action that reacts to incoming event and forward it to outgoing action
 * @param appName
 * @param payload
 * @param socket
 * @returns {Promise.<void>}
 */
async function bip (appName, payload, socket) {
  const { meta } = payload
  const incActionName = meta.name
  const app = await models.App
    .findOne({
      name: appName
    }, {
      withRelated: ['actions']
    })
  const incomingActions = await app.related('actions')
    .where({
      name: incActionName,
      app_id: app.get('id'),
      type: 'incomingActions'
    })
  // Received incoming action must be unique using action meta.name & app_id & type: incomingActions
  const firstIncActionName = R.head(incomingActions).get('name')
  // Find all bips that is associated with the unique incoming action
  const bips = (
    await models.Bip
    .findAll({
      incoming_action_name: firstIncActionName,
      incoming_app_name: app.get('name')
    })
  ).models
  R.map(x => {
    const bipModel = x.toJSON()
    const incActionConds = bipModel.incoming_action_condition_names
    console.log('bip inc action conds name  ', incActionConds)
    // checkActionCondition(bipModel)
  })(bips)
}

async function checkActionCondition(appName, actionName, condName, actionPayload, socket) {
  const checkIncActionMessageName = `${appName}_${actionName}_${condName}`
  const result = await pubsub.publish({
    action: checkIncActionMessageName,
    payload: actionPayload,
    socket
  })
  console.log('result of checking action condition ', result)
  return result
}


export default {
  bip
}
