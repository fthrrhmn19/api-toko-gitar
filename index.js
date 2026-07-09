require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/tokogitar1'
const cors = require('cors')
const path = require('path')

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Berhasil Connect Ke Database')
}).catch((e) => {
    console.log(e)
    console.log('Gagal Connect Ke Database')
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const directory = path.join(__dirname, '/static/')
app.use(express.static(directory))

app.use('/user', require('./routes/user'))
app.use('/gitar', require('./routes/gitar'))
app.use('/transaksi', require('./routes/transaksi'))

if (process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`Berhasil Jalan di port ${PORT}`)
    })
}

module.exports = app;