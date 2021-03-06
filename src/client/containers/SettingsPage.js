import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import Settings from '../components/Settings'
import { getSettings, updateSettings, saveSettings } from '../actions/settings'

const mapStateToProps = (state) => {
  return {
    appKey: state.settings.appKey,
    appSecret: state.settings.appSecret,
    userLoggedIn: state.user.twitterScreenName !== ''
  }
}

const actions = {
  getSettings,
  saveSettings
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators(actions, dispatch), {
    updateSettings: (e) => {
      dispatch(updateSettings(e.target.name, e.target.value))
    },
    returnHome: () => {
      dispatch(push('/'))
    }
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
