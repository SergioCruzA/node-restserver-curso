const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');

app.get('/usuario', function (req, res) {
    let { since, limit }= req.query;
    since = Number(since) || 0;
    limit = Number(limit) || 5;
    
    Usuario.find({}, 'nombre email role img estado' )
        .skip(since)
        .limit(limit)
        .exec(async(err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }
            const count = await Usuario.count({});
            /* Usuario.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo,
                });
            }); */
            res.json({
                ok: true,
                usuarios,
                cuantos: count,
            });

        });
});
  
app.post('/usuario', function (req, res) {
    let { body } = req;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB,
        });
    });
});

app.put('/usuario/:id', function (req, res) {
    // res.json('put Usuario');
    let { id } = req.params;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB,
        });
    });
});

app.delete('/usuario/:id', function (req, res) {
    let { id } = req.params;

    Usuario.findByIdAndRemove(id, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        if(!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado',
                },
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB,
        });
    });
});

module.exports = app;