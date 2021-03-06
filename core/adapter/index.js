import appLoader from './AppLoader'

const initialize = (io) => {
  // Invokes init function of each api
  appLoader().initAPIs()

	/**
   * Emits action to all sockets
	 * Depreciated
	 * Moving this logic to controller
	 * @param action
	 * @param data
	 */
  const emit = (action, data) => {
    io.emit(action, data)
  }

  return {
    emit,
  }
}

export default {
  initialize,
}
