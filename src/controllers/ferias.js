const { response , request } = require('express');
const {Feria} = require('../models');


const getFerias = async(req = request, res = response) => {

    const ferias = await Feria.find()

    res.json({
        ferias
    });

}

module.exports = {
    getFerias
}