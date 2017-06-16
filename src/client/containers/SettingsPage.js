import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Settings from '../components/Settings'
import * as actions from '../actions/settings'

const mapStateToProps = (state) => {
  return {
    appKey: state.appKey,
    appSecret: state.appSecret
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Settings)