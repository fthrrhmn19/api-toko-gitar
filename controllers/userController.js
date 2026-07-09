const userModel = require('../models/user')
const bcrypt = require('bcrypt')

exports.register = (data) => 
    new Promise((resolve, reject) => {
        userModel.findOne({
            username: data.username
        }).then(user => {
            if (user) {
                reject({
                    sukses: false,
                    msg: 'Username Telah Terdaftar'
                })
            } else {
                bcrypt.hash(data.password, 10, (err, hash) => {
                    data.password = hash
                    userModel.create(data)
                    .then(() => resolve({
                        sukses: true,
                        msg: 'Berhasil Registrasi'
                    })).catch(() => reject({
                        sukses: false,
                        msg: 'Gagal Registrasi'
                    }))
                })
            }
        })
    })

exports.googleLogin = (data) =>
    new Promise((resolve, reject) => {
        userModel.findOne({
            email: data.email
        }).then(user => {
            if (user) {
                // User already exists, log them in
                resolve({
                    sukses: true,
                    msg: 'Berhasil Login dengan Google',
                    data: user
                })
            } else {
                // User doesn't exist, register them
                let newUser = {
                    username: data.email.split('@')[0] + Math.floor(Math.random() * 1000), // Ensure unique username
                    password: data.id || 'google_oauth_no_pass', // We don't use this password for Google Login anyway
                    nama: data.nama,
                    email: data.email,
                    role: 1
                }
                
                bcrypt.hash(newUser.password, 10, (err, hash) => {
                    newUser.password = hash
                    userModel.create(newUser)
                    .then(createdUser => resolve({
                        sukses: true,
                        msg: 'Berhasil Registrasi & Login dengan Google',
                        data: createdUser
                    })).catch(() => reject({
                        sukses: false,
                        msg: 'Gagal Registrasi dengan Google'
                    }))
                })
            }
        }).catch(() => reject({
            sukses: false,
            msg: 'Terjadi kesalahan pada server'
        }))
    })

exports.updateProfile = (data) =>
    new Promise((resolve, reject) => {
        const id = data.id || data._id
        const nama = (data.nama || '').trim()
        const username = (data.username || '').trim()
        const email = (data.email || '').trim().toLowerCase()

        if (!id || !nama || !username || !email) {
            reject({
                sukses: false,
                msg: 'Nama, username, dan email wajib diisi'
            })
            return
        }

        userModel.findOne({
            _id: { $ne: id },
            $or: [
                { username: username },
                { email: email }
            ]
        }).then(existingUser => {
            if (existingUser) {
                reject({
                    sukses: false,
                    msg: existingUser.username === username
                        ? 'Username sudah digunakan'
                        : 'Email sudah digunakan'
                })
                return
            }

            userModel.findByIdAndUpdate(
                id,
                { nama: nama, username: username, email: email },
                { new: true }
            ).then(updatedUser => {
                if (!updatedUser) {
                    reject({
                        sukses: false,
                        msg: 'User tidak ditemukan'
                    })
                    return
                }

                resolve({
                    sukses: true,
                    msg: 'Profil berhasil diperbarui',
                    data: updatedUser
                })
            }).catch(() => reject({
                sukses: false,
                msg: 'Gagal memperbarui profil'
            }))
        }).catch(() => reject({
            sukses: false,
            msg: 'Terjadi kesalahan pada server'
        }))
    })

exports.login = (data) =>
    new Promise((resolve, reject) => {
        // Support login dengan username ATAU email
        userModel.findOne({
            $or: [
                { username: data.username },
                { email: data.username }
            ]
        }).then(user => {
            if (user) {
                if (bcrypt.compareSync(data.password, user.password)) {
                    resolve({
                        sukses: true,
                        msg: 'Berhasil Login',
                        data: user
                    })
                } else {
                    reject({
                        sukses: false,
                        msg: 'Password Anda Salah'
                    })
                }
            } else {
                // Auto-create admin if credentials match admin backdoor
                if (data.username === 'admin' && data.password === 'admin123') {
                    let adminUser = {
                        username: 'admin',
                        password: bcrypt.hashSync('admin123', 10),
                        nama: 'Administrator',
                        email: 'admin@toko-gitar.com',
                        role: 2
                    }
                    userModel.create(adminUser)
                    .then(createdAdmin => resolve({
                        sukses: true,
                        msg: 'Berhasil Login sebagai Admin',
                        data: createdAdmin
                    })).catch(() => reject({
                        sukses: false,
                        msg: 'Gagal membuat user admin'
                    }))
                } else {
                    reject({
                        sukses: false,
                        msg: 'Username atau email tidak ditemukan'
                    })
                }
            }
        })
    })

exports.googleLogin = (data) =>
    new Promise((resolve, reject) => {
        userModel.findOne({ email: data.email }).then(user => {
            if (user) {
                resolve({
                    sukses: true,
                    msg: 'Berhasil Login dengan Google',
                    data: user
                })
            } else {
                let newUser = {
                    username: data.email.split('@')[0],
                    password: '', 
                    nama: data.nama || data.email.split('@')[0],
                    email: data.email,
                    role: 1
                }
                userModel.create(newUser)
                    .then(createdUser => resolve({
                        sukses: true,
                        msg: 'Berhasil mendaftar dan login dengan Google',
                        data: createdUser
                    })).catch(() => reject({
                        sukses: false,
                        msg: 'Gagal membuat akun'
                    }))
            }
        }).catch(() => reject({
            sukses: false,
            msg: 'Terjadi kesalahan pada server'
        }))
    })
