import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import styles from './Header.css'
import dn from '../images/dn.png'
import Login from './Login'

export default class Header extends Component {
  render() {
    return (
      <header className={styles.Header}>
        <div className={styles.Logo}>
          <Link to="/">
            <img className={styles.Avatar} src={ dn } />
          </Link>
        </div>
        <div className={styles.Login}><Login /></div>
      </header>
    )
  }
}