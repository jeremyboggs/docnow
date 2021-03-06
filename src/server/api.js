import express from 'express'
import multiparty from 'multiparty'
import * as fs from 'fs'
import { Database } from './db'
import { activateKeys } from './auth'
import log from './logger'

const app = express()
const db = new Database()
const version = '1'

db.startTrendsWatcher({interval: 60 * 1000})

app.get('/setup', (req, res) => {
  db.getSettings()
    .then((result) => {
      if (result && result.appKey && result.appSecret) {
        res.json(true)
      } else {
        res.json(false)
      }
    })
})

app.get('/user', (req, res) => {
  if (req.user) {
    res.json(req.user)
  } else {
    res.status(401)
    res.json({message: 'not logged in'})
  }
})

app.put('/user', (req, res) => {
  db.updateUser(req.user.id, req.body)
    .then(() => {
      res.json({status: 'updated'})
    })
})

app.get('/settings', (req, res) => {
  db.getSettings()
    .then((result) => {
      if (! result) {
        res.json({})
      } else {
        res.json(result)
      }
    })
})

app.put('/settings', (req, res) => {
  const settings = {
    logoUrl: req.body.logoUrl,
    reinstanceTitle: req.body.instanceTitle,
    appKey: req.body.appKey,
    appSecret: req.body.appSecret}
  db.addSettings(settings)
    .then(() => {
      activateKeys()
      res.json({status: 'updated'})
    })
})

app.get('/world', (req, res) => {
  db.getPlaces().then((result) => {
    res.json(result)
  })
})

app.get('/trends', (req, res) => {
  // when a user isn't logged in they get the super users's trends
  let lookup = null
  if (req.user) {
    lookup = db.getUserTrends(req.user.id)
  } else {
    lookup = db.getSuperUser().then((user) => {
      return db.getUserTrends(user.id)
    })
  }
  lookup.then((result) => { res.json(result) })
})

app.put('/trends', (req, res) => {
  db.setUserPlaces(req.user.id, req.body)
    .then(() => {
      db.importLatestTrendsForUser(req.user.id)
        .then(res.json({status: 'updated'}))
    })
})

app.post('/logo', (req, res) => {
  if (req.user) {
    if (req.user.isSuperUser) {
      const form = new multiparty.Form()

      form.parse(req, (parseErr, fields, files) => {
        const {path} = files.imageFile[0]
        const newPath = './userData/images/logo.png'

        fs.readFile(path, (readErr, data) => {
          if (readErr) {
            log.error(readErr)
          } else {
            fs.writeFile(newPath, data, (writeErr) => {
              if (writeErr) {
                log.error(writeErr)
              } else {
                fs.unlink(path, () => {
                  res.send('File uploaded to: ' + newPath)
                })
              }
            })
          }
        })
      })
    }
  }
})

app.post('/searches', (req, res) => {
  if (req.user) {
    db.createSearch(req.user.id, req.body.q)
      .then((search) => {
        const searchId = search.id
        res.json({
          ...search,
          tweets: `/api/v${version}/search/${searchId}/tweets`,
          users: `/api/v${version}/search/${searchId}/users`,
          hashtags: `/api/v${version}/search/${searchId}/hashtags`,
          media: `/api/v${version}/search/${searchId}/media`
        })
        db.importFromSearch(search)
      })
  }
})

app.get('/search/:searchId/tweets', (req, res) => {
  if (req.user) {
    console.log('looking up ' + req.params.searchId)
    db.getSearch(req.params.searchId)
      .then((search) => {
        db.getTweets(search)
          .then((tweets) => {
            res.json(tweets)
          })
      })
  }
})

app.get('/search/:searchId/users', (req, res) => {
  if (req.user) {
    db.getSearch(req.params.searchId)
      .then((search) => {
        db.getUsers(search)
          .then((users) => {
            res.json(users)
          })
      })
    /*
    res.json([
      {
        handle: 'documentnow',
        avatarUrl: 'https://pbs.twimg.com/profile_images/728713121884311552/Yjoenpxp_normal.png',
        screenName: 'DocumentingTheNow',
        tweets: 3789,
        followers: 123,
        following: 123,
        matchingTweets: 5
      },
      {
        handle: 'raffazizzi',
        avatarUrl: 'https://pbs.twimg.com/profile_images/511510383496941568/evXUTpyI_normal.jpeg',
        screenName: 'Raff',
        tweets: 1293,
        followers: 56,
        following: 46,
        matchingTweets: 1
      },
    ])
    */
  }
})

app.get('/search/:searchId/hashtags', (req, res) => {
  if (req.user) {
    console.log('looking up ' + req.params.searchId)
    db.getSearch(req.params.searchId)
      .then((search) => {
        db.getHashtags(search)
          .then((hashtags) => {
            res.json(hashtags)
          })
      })
  }
})

module.exports = app
