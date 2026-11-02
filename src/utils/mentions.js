function getMentioned(m){


const context =
m.message?.extendedTextMessage?.contextInfo;



if(!context)
return null;



return (
context.mentionedJid?.[0] ||
null
);


}



async function resolveMention(sock, chat, jid){


if(!jid)
return null;



try{


const metadata =
await sock.groupMetadata(chat);



const participante =
metadata.participants.find(
p =>
p.id === jid ||
p.lid === jid
);



if(participante?.phoneNumber){

return participante.phoneNumber;

}



if(participante?.id){

return participante.id;

}



return jid;



}catch(e){


console.log(
"Erro resolveMention:",
e.message
);


return jid;


}



}



async function getContactName(sock, jid){


try{


const contato =
await sock.onWhatsApp(jid);



if(
contato &&
contato[0]
){


return (

contato[0].notify ||

contato[0].name ||

contato[0].verifiedName ||

jid.split("@")[0]

);


}



}catch(e){


console.log(
"Erro nome contato:",
e.message
);


}



return jid.split("@")[0];


}



module.exports = {

getMentioned,

resolveMention,

getContactName

};