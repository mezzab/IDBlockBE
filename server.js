const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const Web3 = require("web3");
const path = require("path");
const fs = require("fs");
const solc = require("solc");
const ipfsAPI = require("ipfs-api");
var develop = require("./config/develop");
var utils = require("./utils");

const app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

let abi;
let bytecode;
let contractInstance;
let accounts;


const port = 80;

app.listen(port, () => {
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *    INIT   * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    console.log("✓ Backend escuchando en puerto " + port + "\n");

    connectToBlockchain();
    startSmartContract();

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *    ROUTES   * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    app.get("/", (req, res) => {
        res.send('<div width="100%"  align="center">' + '<img width="150" align="center" src="https://github.com/mezzab/IDBlockBE/raw/master/images/logo.png" style="max-width:100%;">' + '<img align="center" width="450" src="https://github.com/mezzab/IDBlockBE/raw/master/images/logo-texto.png" style="max-width:100%;">' + '</div>');
    });

    app.post("/sendEmail", (req, res) => {
        console.log("* * * * * *  EMAIL * * * * * * ");
        var transporter = nodemailer.createTransport({
            service: develop.mail.service,
            auth: {
                user: develop.mail.user,
                pass: develop.mail.pass
            }
        });

        var code = utils.randomCode();

        transporter.sendMail(utils.mailOptions(req.body.mail, code), function (
            error,
            info
        ) {
            if (error) {
                console.log("Error sending mail: ", error);
            } else {
                console.log(
                    "Email sent to: " +
                    req.body.mail +
                    ". Verification code: *** " +
                    code +
                    " *** .Extra info:" +
                    info.response
                );
            }
        });
        res.send({ code });
    });

    app.post("/sendSMS", (req, res) => {
        console.log("* * * * * *  SMS * * * * * * ");
        var accountSid = develop.sms.accountSid; // Your Account SID from www.twilio.com/console
        var authToken = develop.sms.authToken; // Your Auth Token from www.twilio.com/console

        var twilio = require("twilio");
        var client = new twilio(accountSid, authToken);

        var code = utils.randomCode();
        console.log("SMS sent. " + ". Verification code: *** " + code + " *** .");
        client.messages
            .create({
                body: "Yor code is: *** " + code,
                to: "+54" + req.body.phone, // Text this number
                from: "+15866661838" // From a valid Twilio number
            })
            .then(message => console.log("message.sid: ", message.sid));
        res.send({ code });
    });

    app.post("/saveBlock", (req, res) => {
        console.log("> SAVE USER BLOCK IN IPFS");

        // Aca se realizara el chequeo para validar el legajo.

        const dni = JSON.parse(req.body.legajo).dni;
        const addr = req.body.entityAddr;
        const entityAddress = addr ? addr : accounts[5];
        console.log(
            "\n" + "> El legajo que se guardara es: " + "\n" + req.body.legajo
        );
        console.log("\n" + "> El addres de la entidad es: " + "\n" + entityAddress);

        const ipfs = ipfsAPI("ipfs.infura.io", "5001", { protocol: "https" });
        let testBuffer = new Buffer(req.body.legajo);

        return ipfs.files.add(testBuffer, function (err, file) {
            if (err) {
                console.log("Error saving file: ", err);
                res.send(err);
            }
            const hash = file[0].hash;
            console.log("\n" + "✓ File successfully saved in IPFS.");
            console.log("\n" + "> El hash es: " + "\n" + hash);

            if (!dni || !hash) {
                const msg =
                    "Es necesario un dni y un hash para ejecutar la funcion del Smart Contract.";
                console.log("\n" + msg);
                return res.send(msg);
            }

            setHash(dni, hash);

            setRelation(dni, entityAddress);

            res.send({
                code: 200,
                msg: "Se guardo correctamente el hash en el smart contract"
            });
        });
    });

    app.post("/initSmartContract", (req, res) => {
        startSmartContract()
            .then(() => {
                res.send("EXITO");
            })
            .catch(err => {
                res.send(err);
            });
    });

    app.get("/getHash", (req, res) => {
        const dni = req.query.dni;
        const addr = req.query.addr;
        const entityAddress = addr ? addr : accounts[5];
        if (!dni) return res.send("Es necesario un dni para realizar la consulta.");
        getHash(dni, entityAddress)
            .then(hash => {
                console.log("✓ Exito! El hash es: ", hash);
                res.send(hash);
            })
            .catch(err => {
                console.log("Error: No es posible acceder al hash.");
                res.send({ msg: "Error: No es posible acceder al hash.", err });
            });
    });

    app.get("/carDealer/getHash", (req, res) => {
        const dni = req.query.dni;
        if (!dni) return res.send("Es necesario un dni para realizar la consulta.");
        contractInstance.methods
            .getHash(dni)
            .call({ from: accounts[5] })
            .then(hash => {
                res.send({ msg: "✓ Exito: Se accedió al hash.", hash });
            })
            .catch(err => {
                res.send({ msg: "✗ Error: No es posible acceder al hash." });
            });
    });

    app.get("/mercadolibre/getHash", (req, res) => {
        const dni = req.query.dni;
        if (!dni) return res.send("Es necesario un dni para realizar la consulta.");
        contractInstance.methods
            .getHash(dni)
            .call({ from: accounts[6] })
            .then(hash => {
                res.send({ msg: "✓ Exito: Se accedió al hash.", hash });
            })
            .catch(err => {
                res.send({ msg: "✗ Error: No es posible acceder al hash." });
            });
    });

    app.get("/ripio/getHash", (req, res) => {
        const dni = req.query.dni;
        if (!dni) return res.send("Es necesario un dni para realizar la consulta.");
        contractInstance.methods
            .getHash(dni)
            .call({ from: accounts[7] })
            .then(hash => {
                res.send({ msg: "✓ Exito: Se accedió al hash.", hash });
            })
            .catch(err => {
                res.send({ msg: "✗ Error: No es posible acceder al hash." });
            });
    });

    app.post("/setHash", (req, res) => {
        const dni = req.body.dni;
        const hash = req.body.hash;
        if (!dni || !hash)
            return res.send(
                "Es necesario un dni y un hash para realizar la consulta."
            );
        setHash(dni, hash)
            .then(() => {
                const msg = "✓ Exito! Se guardo el hash en el SC.";
                console.log(msg);
                res.send(msg);
            })
            .catch(err => {
                res.send({
                    msg: "Error: No es posible guardar el hash en el contrato.",
                    err
                });
            });
    });

    app.post("/setRelation", (req, res) => {
        const dni = req.body.dni;
        const addr = req.body.addr;
        const entityAddress = addr ? addr : accounts[5];
        // if (!dni || !addr) return res.send('Es necesario un dni y un addr para realizar la consulta.')
        // setRelation(dni, addr)
        setRelation(dni, entityAddress)
            .then(() => {
                const msg = "✓ Exito! Se genero la relacion en el SC.";
                console.log(msg);
                res.send(msg);
            })
            .catch(err => {
                res.send({
                    msg: "Error: No es posible crear la relacion dni/entityAddress.",
                    err
                });
            });
    });
});

/* * * * * * * * * * * * * * * * * * * * *   SMART CONTRACT UTILS   * * * * * * * * * * * * * * * * * * * * * */
function connectToBlockchain() {
    if (typeof web3 !== "undefined") {
        web3 = new Web3(web3.currentProvider);
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    console.log("✓ Conectado a ganache!");
    web3.eth.getAccounts(function (error, accounts) {
        console.log(" > Las cuentas ganache son: ");
        accounts.map((x, i) => console.log("  " + i + ") " + x));
        console.log("\n" + " > La cuenta a utilizar sera: ");
        console.log("  0)" + accounts[0] + "\n" + "\n");
        web3.eth.defaultAccount = accounts[0];
    });
}

async function startSmartContract() {
    console.log("\n" + "> Building and deploying smart contract... " + "\n");
    accounts = await web3.eth.getAccounts();
    console.log("   Buscando smart contract IdentitiesBlock.sol..." + "\n");

    let helloPath = path.resolve(__dirname, "contracts", "IdentitiesBlock.sol");
    let code = fs.readFileSync(helloPath, "UTF-8").toString();
    let compiledCode = solc.compile(code, 1);
    abi = JSON.parse(compiledCode.contracts[":IdentitiesBlock"].interface);
    bytecode = compiledCode.contracts[":IdentitiesBlock"].bytecode;

    let identitiesContract = new web3.eth.Contract(abi, {
        from: accounts[0],
        gas: 47000,
        data: bytecode
    });

    contractInstance = await identitiesContract
        .deploy()
        .send(
            {
                from: accounts[0],
                gas: 1500000
            },
            (err, txHash) => {
                console.log("send:", err, txHash);
            }
        )
        .on("error", err => {
            console.log("error:", err);
        })
        .on("transactionHash", err => {
            console.log("transactionHash:", err);
        })
        .on("receipt", receipt => {
            console.log("receipt:", receipt);
            identitiesContract.options.address = receipt.contractAddress;
        });

    console.log("contractInstance.options:", contractInstance.options);

    console.log("\n" + "✓ Se deployo correctamente el smart contract!" + "\n");
}

// Recibe un dni y un address de la entidad que quiere conocer el hash.
async function getHash(dni, entityAddr) {
    console.log("\n" + "\n" + "La entidad de address: ", entityAddr);
    console.log("Busca el hash de " + dni + "...");
    return await contractInstance.methods.getHash(dni).call({ from: entityAddr });
}

// Recibe el dni del usuario y el hash a IPFS donde esta almacenado el legajo con la informacion.
async function setHash(dni, hash) {
    console.log("\n" + "> SET HASH IN SMART CONTRACT ");
    console.log("Guardando el hash:");
    console.log("   Dni:", dni);
    console.log("   Hash:", hash);
    // accounts[0] es nuestro addres (con el que creamos el smartContract);
    try {
        const transaction = await contractInstance.methods
            .setHash(dni, hash)
            .send({ from: accounts[0], gas: 150000 });
        console.log("\n" + "✓ Exito! Se guardo correctamente el hash en el SC.");
        console.log("Transaction information: ");
        console.log(transaction);
    } catch (err) {
        res.send({
            msg: "Error: No es posible guardar el hash en el contrato.",
            err
        });
    }
}

// Recibe el dni del usuario y el address de la entidad para generar la relacion en la whitelist
async function setRelation(dni, entityAddr) {
    console.log(" ");
    console.log("> SET RELATION IN SMART CONTRACT ");
    console.log("Guardando relacion:");
    console.log("   Dni:", dni);
    console.log("   Cuenta:", entityAddr);
    try {
        const transaction = await contractInstance.methods
            .setRelation(dni, entityAddr)
            .send({ from: accounts[0], gas: 150000 });

        console.log(
            "\n" +
            "✓ Exito! Se guardo correctamente la relacion entidad/dni en el SC."
        );
        console.log("Transaction information: ");
        console.log(transaction);
    } catch (err) {
        res.send({
            msg: "Error: No es posible crear la relacion dni/entityAddress.",
            err
        });
    }
}

// https://ethereum.stackexchange.com/questions/41258/accessing-a-mapping-variable-from-web3
