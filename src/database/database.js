const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");



const pasta =
path.join(
__dirname,
"storage"
);



function criarErroBanco(acao, nome, erroOriginal){

    const codigo =
        erroOriginal && erroOriginal.code
            ? ` (${erroOriginal.code})`
            : "";

    const erro = new Error(
        `Não foi possível ${acao} o banco "${nome}"${codigo}. O arquivo original foi preservado.`
    );

    erro.cause = erroOriginal;

    return erro;

}


function carregar(nome){

    const arquivo =
        path.join(
            pasta,
            nome
        );

    if(!fs.existsSync(arquivo)){

        try {

            fs.mkdirSync(
                pasta,
                { recursive:true }
            );

            fs.writeFileSync(
                arquivo,
                "{}",
                { flag:"wx" }
            );

            return {};

        } catch(error) {

            if(error.code !== "EEXIST"){

                throw criarErroBanco(
                    "criar",
                    nome,
                    error
                );

            }

        }

    }

    let conteudo;

    try {

        conteudo =
            fs.readFileSync(
                arquivo,
                "utf-8"
            );

    } catch(error) {

        throw criarErroBanco(
            "ler",
            nome,
            error
        );

    }

    if(!conteudo.trim()){

        return {};

    }

    try {

        const dados = JSON.parse(conteudo);

        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            const erroFormato = new TypeError(
                `O banco "${nome}" deve conter um objeto JSON no nível superior. O arquivo original foi preservado.`
            );
            erroFormato.code = "INVALID_DATABASE_ROOT";
            throw erroFormato;
        }

        return dados;

    } catch(error) {

        if (error && error.code === "INVALID_DATABASE_ROOT") {
            throw error;
        }

        throw criarErroBanco(
            "interpretar",
            nome,
            error
        );

    }

}



const databaseInicialGroups =
carregar(
"groups.json"
);

const databaseInicialUsers =
carregar(
"users.json"
);

let ultimoGroupsPersistido =
JSON.stringify(
databaseInicialGroups,
null,
4
);

let ultimoUsersPersistido =
JSON.stringify(
databaseInicialUsers,
null,
4
);

let usersBatchDepth =
0;

let usersBatchPending =
false;


function salvarSeAlterado(nome, dados, ultimoPersistido){

const conteudo =
    JSON.stringify(
        dados,
        null,
        4
    );

if(conteudo === ultimoPersistido){

    return ultimoPersistido;

}

gravarAtomico(
    nome,
    conteudo
);

return conteudo;

}


function gravarAtomico(nome, conteudo){

    const destino =
        path.join(
            pasta,
            nome
        );

    const temporario =
        path.join(
            pasta,
            `.${nome}.${process.pid}.${randomUUID()}.tmp`
        );

    let descritor;
    let temporarioCriado = false;

    try {

        descritor = fs.openSync(
            temporario,
            "wx"
        );

        temporarioCriado = true;

        fs.writeFileSync(
            descritor,
            conteudo,
            "utf8"
        );

        fs.closeSync(descritor);
        descritor = undefined;

        fs.renameSync(
            temporario,
            destino
        );

        temporarioCriado = false;

    } catch(error) {

        if(descritor !== undefined){

            try {

                fs.closeSync(descritor);

            } catch(erroFechamento) {

                error.erroFechamentoTemporario =
                    erroFechamento;

            }

        }

        if(temporarioCriado){

            try {

                fs.unlinkSync(temporario);

            } catch(erroRemocao) {

                if(erroRemocao.code !== "ENOENT"){

                    error.erroRemocaoTemporario =
                        erroRemocao;

                }

            }

        }

        throw error;

    }

}


const database = {


groups:
databaseInicialGroups,


users:
databaseInicialUsers,




saveGroups(){


ultimoGroupsPersistido =
salvarSeAlterado(
    "groups.json",
    this.groups,
    ultimoGroupsPersistido
);


},

beginUsersBatch(){

    usersBatchDepth++;

},

endUsersBatch(){

    if(usersBatchDepth === 0){

        return;

    }

    usersBatchDepth--;

    if(
        usersBatchDepth === 0 &&
        usersBatchPending
    ){

        this.saveUsers();

    }

},




saveUsers(){

if(usersBatchDepth > 0){

    usersBatchPending = true;
    return;

}

ultimoUsersPersistido =
salvarSeAlterado(
    "users.json",
    this.users,
    ultimoUsersPersistido
);

usersBatchPending = false;


}



};



module.exports =
database;
