const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

function normalizar(id){

    if(!id)
        return null;


    const value = String(id).trim().toLowerCase();
    const at = value.indexOf("@");
    if(at < 0) return value;
    const local = value.slice(0, at).split(":")[0];
    const domain = value.slice(at + 1);
    return `${local}@${domain}`;

}


const arquivo =
    path.join(
        process.cwd(),
        "src",
        "database",
        "mutes.json"
    );




function carregar(){

    if(!fs.existsSync(arquivo)){

        try {

            fs.writeFileSync(
                arquivo,
                "{}",
                { flag:"wx" }
            );

        } catch(erro) {

            if(erro.code !== "EEXIST"){

                throw erro;

            }

        }

    }


    const dados = JSON.parse(
        fs.readFileSync(
            arquivo,
            "utf8"
        )
    );

    return validarDados(dados);

}



function validarDados(data){

    if(
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ){

        throw new TypeError(
            "O arquivo de mutes deve conter um objeto JSON no nível superior"
        );

    }

    for(const usuarios of Object.values(data)){

        if(
            !usuarios ||
            typeof usuarios !== "object" ||
            Array.isArray(usuarios)
        ){

            throw new TypeError(
                "Cada grupo do arquivo de mutes deve conter um objeto de usuários"
            );

        }

        for(const mutado of Object.values(usuarios)){

            if(typeof mutado !== "boolean"){

                throw new TypeError(
                    "Os registros de mutes devem conter valores booleanos"
                );

            }

        }

    }

    return data;

}



function salvar(data){

    validarDados(data);

    const conteudo =
        JSON.stringify(
            data,
            null,
            2
        );

    if(typeof conteudo !== "string"){

        throw new TypeError(
            "Não foi possível serializar os dados de mutes"
        );

    }

    gravarAtomico(
        conteudo
    );

}



function gravarAtomico(conteudo){

    const diretorio =
        path.dirname(arquivo);

    const temporario =
        path.join(
            diretorio,
            `.${path.basename(arquivo)}.${process.pid}.${randomUUID()}.tmp`
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
            arquivo
        );

        temporarioCriado = false;

    } catch(erro){

        if(descritor !== undefined){

            try {

                fs.closeSync(descritor);

            } catch(erroFechamento) {

                erro.erroFechamentoTemporario =
                    erroFechamento;

            }

        }

        if(temporarioCriado){

            try {

                fs.unlinkSync(temporario);

            } catch(erroRemocao) {

                if(erroRemocao.code !== "ENOENT"){

                    erro.erroRemocaoTemporario =
                        erroRemocao;

                }

            }

        }

        throw erro;

    }

}



function mutar(
    grupo,
    usuario,
    lid = null
){

    const dados =
        carregar();


    if(!dados[grupo]){

        dados[grupo] = {};

    }


    dados[grupo][normalizar(usuario)] = true;


    if(lid){

        dados[grupo][normalizar(lid)] = true;

    }


    salvar(dados);

}



function desmutar(grupo, usuario){

    const dados =
        carregar();


    if(!dados[grupo])
        return;


    const id =
        normalizar(usuario);


    delete dados[grupo][id];


    salvar(dados);

}



function estaMutado(grupo, usuario){

    const dados =
        carregar();


   return !!(
    dados[grupo] &&
    dados[grupo][normalizar(usuario)]
);

}



module.exports = {

    mutar,

    desmutar,

    estaMutado

};
