// server.js
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const app = express();
const nodemailer = require("nodemailer");
const Web3 = require("web3");
const path = require('path');
const fs = require('fs');
const solc = require('solc');

const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }));
require("./app/routes")(app, {});
app.listen(port, () => {

    console.log("✓ Backend escuchando en puerto " + port);
    console.log(' ')
    console.log(' ')
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    console.log("✓ Conectado a ganache!");

    web3.eth.getAccounts(function (error, accounts) {
        console.log(" > Las cuentas ganache son: ");
        accounts.map((x, i) => console.log('  ' + i + ') ' + x))
        console.log(" > La cuenta a utilizar sera: ");
        console.log('  0)' + accounts[0])
        web3.eth.defaultAccount = accounts[0];
        console.log(' ')
        console.log(' ')
    })

    startSmartContract();

    // Blockchain Routes - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    app.post('/initSmartContract', (req, res) => {

        startSmartContract()
            .then(() => {
                res.send('EXITO');
            })
            .catch(err => {
                res.send(err);
            });
    });

    app.get('/getHash', (req, res) => {
        const dni = req.query.dni;
        if (!dni) return res.send('Es necesario un dni para realizar la consulta.')
        getHash(dni)
            .then((hash) => {
                console.log("✓ Exito! El hash es: ", hash);
                res.send(hash);
            })
            .catch(err => {
                console.log("Error: No es posible acceder al hash.");
                res.send('Error: No es posible acceder al hash. Details -->' + err);
            });
    });

    app.post('/setHash', (req, res) => {
        const dni = req.body.dni;
        const hash = req.body.hash;
        if (!dni || !hash) return res.send('Es necesario un dni y un hash para realizar la consulta.')
        setHash(dni, hash)
            .then(() => {
                console.log("✓ Exito! Se guardo el hash y se genero la relacion correctamente");
                res.send('EXITO!');
            })
            .catch(err => {
                res.send({ msg: 'Error: No es posible acceder al hash.', err });
            });
    });

});

let abi;
let bytecode;
let contractInstance;
let accounts;

async function startSmartContract() {
    console.log(' ')
    console.log('> Building and deploying smart contract... ');
    accounts = await web3.eth.getAccounts();
    console.log("   Buscando smart contract IdentitiesBlock.sol...");

    let helloPath = path.resolve(__dirname, 'contracts', 'IdentitiesBlock.sol');
    let code = fs.readFileSync(helloPath, 'UTF-8').toString();
    let compiledCode = solc.compile(code, 1);
    abi = JSON.parse(compiledCode.contracts[':IdentitiesBlock'].interface);
    bytecode = compiledCode.contracts[':IdentitiesBlock'].bytecode;

    let identitiesContract = new web3.eth.Contract(abi, { from: accounts[0], gas: 47000, data: bytecode });

    console.log("   Deployando y deployando smart contrat...");
    contractInstance = await identitiesContract.deploy()
        .send({
            from: accounts[0],
            gas: 1500000
        }, (err, txHash) => {
            console.log('send:', err, txHash);
        })
        .on('error', (err) => {
            console.log('error:', err);
        })
        .on('transactionHash', (err) => {
            console.log('transactionHash:', err);
        })
        .on('receipt', (receipt) => {
            console.log('receipt:', receipt);
            identitiesContract.options.address = receipt.contractAddress;
        });

    // console.log('contractInstance.options:', contractInstance.options);

    console.log("");
    console.log("✓ Completado!");
}

async function getHash(dni) {
    console.log(' ')
    console.log(' ')
    console.log('Buscando dni ' + dni + '...')
    return await contractInstance.methods.getHash(dni).call({ from: accounts[2] });
}

async function setHash(dni, hash, entityAccount = accounts[2]) {
    console.log(' ')
    console.log(' ')
    console.log('Guardando:')
    console.log('   Dni:', dni)
    console.log('   Hash:', hash)
    console.log('   Cuenta:', entityAccount)
    return await contractInstance.methods.setHash(dni, hash).send({ from: entityAccount, gas: 150000 });
}
