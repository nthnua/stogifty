require('dotenv').config()
const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const helmet = require("helmet")
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const multer = require('multer')
const User = require('./models/user')
const { get404, get500 } = require('./controllers/error')

const app = express()
app.use(helmet())
const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
})
const csrfProtection = csrf()

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.set('view engine', 'ejs')
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')
const isAuth = require('./middlewares/is-auth')
const { postOrder } = require('./controllers/shop')

app.use(express.urlencoded({ extended: false }))
app.use(multer({ storage: fileStorage, fileFilter }).single('image'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store
    })
)
app.use(flash())
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn
    next()
})
app.use((req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next()
            }
            req.user = user
            next()
        })
        .catch(err => {
            next(new Error(err))
        })
})
app.post('/create-order', isAuth, postOrder)
app.use(csrfProtection)
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.get('/500', get500)
app.use(get404)

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('DB Connected!')
        app.listen(process.env.PORT || 3000)
    })
    .catch(err => {
        console.error(err)
    })
