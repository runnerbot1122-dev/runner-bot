const fs = require("fs");
const path = require("path");


const comandos = new Map();



function carregarComandos(){


const pasta =
path.join(
__dirname,
"../commands"
);



const categorias =
fs.readdirSync(
pasta
);



for(
const categoria of categorias
){


const caminho =
path.join(
pasta,
categoria
);



const arquivos =
fs.readdirSync(
caminho
)
.filter(
arquivo =>
arquivo.endsWith(".js")
);



for(
const arquivo of arquivos
){

const comando =
require(
path.join(
caminho,
arquivo
)
);

// A categoria é anexada ao comando para que o runner possa aplicar uma
// barreira central de autorização aos comandos da pasta owner.
if (comando && typeof comando === "object" && !comando.category) {
    comando.category = categoria;
}

if(Array.isArray(comando.name)){


for(const nome of comando.name){

comandos.set(
nome,
comando
);

}


}else{


comandos.set(
comando.name,
comando
);


}



console.log(
`Comando carregado: ${comando.name}`
);


}


}


}



carregarComandos();



module.exports =
comandos;