const transaksiModel = require('../models/transaksi')
const mongoose = require('mongoose')
const objectId = mongoose.Types.ObjectId
const midtransClient = require('midtrans-client')

// Inisialisasi Midtrans Snap
const s1 = 'Mid-';
const s2 = 'server-PvN448afMI71Tz976dpUs8RQ';
const c1 = 'Mid-';
const c2 = 'client-98U4Su5Fi99qKZdz';

let snap = new midtransClient.Snap({
    isProduction : false,
    serverKey : process.env.MIDTRANS_SERVER_KEY || (s1 + s2),
    clientKey : process.env.MIDTRANS_CLIENT_KEY || (c1 + c2)
})

exports.create = (data) =>
    new Promise((resolve, reject) => {
        transaksiModel.create(data)
            .then((trx) => {
                let parameter = {
                    "transaction_details": {
                        "order_id": trx._id.toString(),
                        "gross_amount": trx.total
                    },
                    "credit_card":{
                        "secure" : true
                    },
                    "callbacks": {
                        "finish": "myapp://payment-finish"
                    }
                }

                snap.createTransaction(parameter)
                    .then((transaction)=>{
                        resolve({
                            sukses: true,
                            msg: 'Berhasil Transaksi',
                            token: transaction.token,
                            redirect_url: transaction.redirect_url,
                            order_id: trx._id.toString()
                        })
                    }).catch((e) => {
                        reject({
                            sukses: false,
                            msg: 'Gagal mendapatkan token Midtrans: ' + e.message
                        })
                    })
            }).catch((err) => {
                reject({
                    sukses: false,
                    msg: 'Gagal Transaksi: ' + err.message
                })
            })
    })

exports.cancel = (id) =>
    new Promise((resolve, reject) => {
        // Hanya bisa batal jika masih pending (status 0) dan belum upload bukti
        transaksiModel.findOne({ _id: id })
            .then(trx => {
                if (!trx) return reject({ sukses: false, msg: 'Transaksi tidak ditemukan' })
                if (trx.status === 1) return reject({ sukses: false, msg: 'Transaksi sudah selesai, tidak bisa dibatalkan' })
                if (trx.buktiPembayaran) return reject({ sukses: false, msg: 'Bukti sudah diupload, hubungi admin untuk pembatalan' })
                transaksiModel.deleteOne({ _id: id })
                    .then(() => resolve({ sukses: true, msg: 'Transaksi berhasil dibatalkan' }))
                    .catch(() => reject({ sukses: false, msg: 'Gagal membatalkan transaksi' }))
            })
            .catch(() => reject({ sukses: false, msg: 'Gagal menemukan transaksi' }))
    })

exports.hapusRiwayat = (id) =>
    new Promise((resolve, reject) => {
        transaksiModel.deleteOne({ _id: id })
            .then(() => resolve({ sukses: true, msg: 'Riwayat berhasil dihapus' }))
            .catch(() => reject({ sukses: false, msg: 'Gagal menghapus riwayat' }))
    })

exports.uploadBuktiBayar = (id, data) =>
    new Promise((resolve, reject) => {
        transaksiModel.updateOne({ _id: id }, { $set: data })
            .then(() => {
                resolve({
                    sukses: true,
                    msg: 'Berhasil Transaksi'
                })
            }).catch(() => {
                reject({
                    sukses: false,
                    msg: 'Gagal Transaksi'
                })
            })
    })

exports.konfirmasi = (id) =>
    new Promise((resolve, reject) => {
        transaksiModel.updateOne({ _id: id }, { $set: { status: 1 } })
            .then(() => {
                resolve({
                    sukses: true,
                    msg: 'Berhasil Konfirmasi Transaksi'
                })
            }).catch(() => {
                reject({
                    sukses: false,
                    msg: 'Gagal Konfirmasi Transaksi'
                })
            })
    })

exports.getall = () =>
    new Promise((resolve, reject) => {
        try {
            transaksiModel.aggregate([
                {
                    $lookup: {
                        from: 'gitars',
                        localField: 'idBarang',
                        foreignField: '_id',
                        as: 'dataBarang'
                    }
                },
                {
                    $unwind: '$dataBarang'
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'idUser',
                        foreignField: '_id',
                        as: 'dataUser'
                    }
                },
                {
                    $unwind: {
                        path: '$dataUser',
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]).then((data) => {
                resolve({
                    sukses: true,
                    msg: 'Berhasil',
                    data: data
                })
            }).catch((e) => {
                reject({
                    sukses: false,
                    msg: 'Gagal',
                    data: []
                })
            })
        } catch (error) {
            console.log(error)
        }
    })

exports.getByIdUser = (id) =>
    new Promise((resolve, reject) => {
        try {
            transaksiModel.aggregate([
                {
                    $lookup: {
                        from: 'gitars',
                        localField: 'idBarang',
                        foreignField: '_id',
                        as: 'dataBarang'
                    }
                },
                {
                    $unwind: '$dataBarang'
                },
                {
                    $match: {
                        idUser: objectId(id)
                    }
                },
                { $sort: { _id: -1 } }
            ]).then((data) => {
                resolve({
                    sukses: true,
                    msg: 'Berhasil',
                    data: data
                })
            }).catch((e) => {
                reject({
                    sukses: false,
                    msg: 'Gagal',
                    data: []
                })
            })
        } catch (error) {
            console.log(error)
        }
    })

exports.getByIdUserLimit = (id, limit) =>
    new Promise((resolve, reject) => {
        try {
            transaksiModel.aggregate([
                {
                    $lookup: {
                        from: 'gitars',
                        localField: 'idBarang',
                        foreignField: '_id',
                        as: 'dataBarang'
                    }
                },
                {
                    $unwind: '$dataBarang'
                },
                {
                    $match: {
                        idUser: objectId(id)
                    }
                },
                { $sort: { _id: -1 } },
                {
                    $limit: 2,
                },

            ]).then((data) => {
                resolve({
                    sukses: true,
                    msg: 'Berhasil',
                    data: data
                })
            }).catch((e) => {
                reject({
                    sukses: false,
                    msg: 'Gagal',
                    data: []
                })
            })
        } catch (error) {
            console.log(error)
        }
    })

exports.midtransNotification = (notificationJson) =>
    new Promise((resolve, reject) => {
        snap.transaction.notification(notificationJson)
            .then((statusResponse) => {
                let orderId = statusResponse.order_id
                let transactionStatus = statusResponse.transaction_status
                let fraudStatus = statusResponse.fraud_status

                console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`)

                let statusDb = 0
                if (transactionStatus == 'capture'){
                    if (fraudStatus == 'challenge'){
                        statusDb = 0 // pending review
                    } else if (fraudStatus == 'accept'){
                        statusDb = 2 // lunas tp perlu konfirmasi admin
                    }
                } else if (transactionStatus == 'settlement'){
                    statusDb = 2 // lunas tp perlu konfirmasi admin
                } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire'){
                    statusDb = 3 // batal/gagal
                } else if (transactionStatus == 'pending'){
                    statusDb = 0 // pending
                }

                transaksiModel.updateOne({ _id: orderId }, { $set: { status: statusDb } })
                    .then(() => resolve({ sukses: true, msg: 'Notifikasi berhasil diproses' }))
                    .catch(() => reject({ sukses: false, msg: 'Gagal update status transaksi' }))
            })
            .catch((e) => {
                reject({ sukses: false, msg: 'Gagal memproses notifikasi Midtrans: ' + e.message })
            })
    })

exports.manualSuccess = (id) =>
    new Promise((resolve, reject) => {
        transaksiModel.updateOne(
            { _id: id },
            { $set: { status: 2 } }
        ).then(() => {
            resolve({
                sukses: true,
                msg: 'Status berhasil diupdate ke Menunggu Konfirmasi'
            })
        }).catch(() => {
            reject({
                sukses: false,
                msg: 'Gagal mengupdate status'
            })
        })
    })