let express = require('express');
let router = express.Router();
let request = require('request')
const baseUrl = 'https://api.github.com/users/'
const rateLimitError = 'Github rate limit reached. Please try after sometime'
const invalidUser = 'User does not exists! Please enter a valid github username'


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'GitHub User Repos' });
});

router.post('/data', function (req, res) {
  let data = req.body
  let page = 1

  function repoCount(user, callback) {
    let url = baseUrl + user.username;
    let options = {
      url: url,
      headers: {
        'User-Agent': 'user-repo-details'
      }
    };
    request(options, function(err, response, body){
      if (err) {
        callback(err)
      } else if (response.statusCode === 403) {
        let content = JSON.parse(body)
        callback({message: rateLimitError})
      } else if (response.statusCode !== 404) {
        let meta = JSON.parse(body)
        callback(null, meta)
      } else {
        callback({message: invalidUser})
      }
    })
  }

  function getForkedRepos(userDetails, repoCount, forkCount, callback) {
    let url = baseUrl + userDetails.login + '/repos?page=' + page + '&per_page=100'
    let options = {
      url: url,
      headers: {
        'User-Agent': 'user-repo-details'
      }
    };
    request(options, function(err, response, body){
      if (!err) {
        let content = JSON.parse(body)
        let current = 0
        for (let i = 0; i < content.length; i++) {
          if (content[i] && content[i]["fork"]) {
            forkCount++;
            current++;
          }
        }
        if (repoCount > 100) {
          page++
          getForkedRepos(userDetails, repoCount-100, forkCount, callback)
        } else {
          callback(null, forkCount)
        }
      }
    })
  }

  repoCount(data, function (err, resp) {
    if (!err) {
      let repoCount = resp.public_repos
      getForkedRepos(resp, repoCount, 0, function (error, forked) {
        if (!error) {
          let result = {
            "totalRepos": repoCount,
            "forkedRepos": forked,
            "selfRepos": repoCount-forked
          }
          res.render('result', result)
        }
      })
    } else {
        res.render('error', err)
    }
  })
})

module.exports = router;
