const router = require('express').Router()
const transaksiController = require('../controllers/transaksiController')
const uploadConfig = require('../uploadConfig')
const fields = uploadConfig.upload.fields([
    {
        name: 'buktiPembayaran',
        maxCount: 1
    }
])

router.post('/create', fields, (req, res) => {
    // req.body.buktiPembayaran = uploadConfig.cekNull(req.files.buktiPembayaran)

    transaksiController.create(req.body)
        .then(result => res.json(result))
        .catch(err => res.json(err))
})

router.put('/upload-bukti/:id', fields, (req, res) => {
    req.body.buktiPembayaran = uploadConfig.cekNull(req.files.buktiPembayaran)

    transaksiController.uploadBuktiBayar(req.params.id, req.body)
        .then(result => res.json(result))
        .catch(err => res.json(err))
})

router.put('/konfirmasi/:id', (req, res) => {
    transaksiController.konfirmasi(req.params.id)
        .then(result => res.json(result))
        .catch(err => res.json(err))
})

router.get('/getall', (req, res) => {

    transaksiController.getall()
        .then(result => res.json(result))
        .catch(err => res.json(err))
})

router.get('/getbyiduser/:id', (req, res) => {

    transaksiController.getByIdUser(req.params.id)
        .then(result => res.json(result))
        .catch(err => res.json(err))
})

router.get('/getbyiduserlimit/:id', (req, res) => {

    transaksiController.getByIdUserLimit(req.params.id)
        .then(result => res.json(result))
        .catch(err => res.json(err))
})

router.delete('/cancel/:id', (req, res) => {
    transaksiController.cancel(req.params.id)
        .then(result => res.json(result))
        .catch(err => res.json(err))
})

router.delete('/hapus-riwayat/:id', (req, res) => {
    transaksiController.hapusRiwayat(req.params.id)
        .then(result => res.json(result))
        .catch(err => res.json(err))
})

router.post('/midtrans-notification', (req, res) => {
    transaksiController.midtransNotification(req.body)
        .then(result => res.json(result))
        .catch(err => res.json(err))
})
router.put('/manual-sukses/:id', (req, res) => {
    transaksiController.manualSuccess(req.params.id)
        .then(result => res.json(result))
        .catch(err => res.json(err))
})

module.exports = router