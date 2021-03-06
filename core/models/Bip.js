import base from './base'
import db from '../bookshelf'
import schemaUtils from '../bookshelf/schemaUtils'

const { bookshelf } = db
const tableName = 'bips'

const Bip = base.extend({
  tableName,
  attributes: [],
  incomingAction () {
    return this.belongsTo('Action')
  },
  outgoingAction () {
    return this.belongsTo('Action')
  }
}, {
  attributes: schemaUtils.getAttributes(tableName)
})

const Bips = bookshelf.Collection.extend({
  model: Bip
})

export default {
  single: bookshelf.model('Bip', Bip),
  collection: bookshelf.collection('Bips', Bips)
}
