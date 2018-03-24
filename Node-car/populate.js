
const express = require('express');
const app = express();
const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'localhost:9200'
})


var client = new elasticsearch.Client({
   hosts: [ 'localhost:9200']
});


client.ping({
     requestTimeout: 30000,
 }, function(error) {
     if (error) {
         console.error('elasticsearch cluster is down!');
     } else {
         console.log('Everything is ok');
     }
 });


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/populate', function (req, res) {

    async function getApiBrands() {
        const brands = await getBrands();
        return brands;
    }

    getApiBrands().then(brands => {
        brands.forEach(async brand => {
            const models = await getModels(brand)
            models.forEach(model => {
                client.create({
                    index: 'voitures',
                    type: 'voiture',
                    id: model.uuid,
                    body: model
                }, function (error, response) {
                    if(error) {
                        console.log(error);
                    }
                })
            })
        })
    })
})

app.listen(6969, function () {
    console.log('Express server is listening on port 6969!')
});