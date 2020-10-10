const router = require('express').Router()
const verify = require('./verifyToken')

router.get('/', verify, (req, res) => {
    res.json({ posts: { title: 'Test post', description: 'Lorem ipsum'}})
})

module.exports = router