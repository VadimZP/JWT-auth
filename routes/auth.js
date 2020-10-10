const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const { registerValidation, loginValidation } = require('../validation') 

router.post('/register', async (req, res) => {
    const { error } = registerValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const emailExists = await User.findOne({ email: req.body.email })
    if(emailExists) return res.status(400).send('Email exists')

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    })
    try {
        const savedUser = await user.save()
        res.send({user: user._id})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/login', async (req, res) => {
    const { error } = loginValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const user = await User.findOne({ email: req.body.email })
    if(!user) return res.status(400).send('Email is not found')

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if(!validPassword) return res.status(400).send('Invalid password')

    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRENT)
    res.header('auth-token', token).send(token)

    res.send('Logged in')
})


module.exports = router