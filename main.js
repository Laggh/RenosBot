import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import mysql from 'mysql2/promise';


console.clear();
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
/*
const prompt = "calcule 150 + 35 + 20 + 22";
const result = await model.generateContent(prompt);
console.log(result.response.text());
*/


console.log("Inicializando bot:");

const sql = await mysql.createConnection({ 
    host: "127.0.0.1",
    user: "rootUser",
    password: "senha123",
    database: "DISCORD"
});
console.log("Conectado ao banco de dados");


const client = new Client( {intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] } );
console.log("Conectando ao discord");


const config = {
    maxMessageFetch: 25
};

client.once('ready', () => {
    console.log('Bot is online!');
    
});

function getUserData(discordId){
    return sql.query(`SELECT * FROM Pessoas WHERE discord_id = ${discordId}`)[0];
}

client.on('messageCreate', async message => {
    const texto = message.content.toLowerCase();
    const inicioTexto = texto.split(" ")[0];

    const restoArray = texto.split(" ").slice(1);  
    const restoTexto = restoArray.join(" ");


    const autor = message.author;
    const canal = message.channel

    if(Math.random() < 1/100){canal.send('bonoro23')}
    if(message.channelId != "1328499991378919536"){return}
    if(message.author.bot){return}

    console.log(message.author.displayName + ' : ' + message.content);

    if (texto === "casino"){
        const numero = Math.floor(Math.random() * 100) + 1;
        canal.send(`você ganhou ${numero} reais`);
    }

    if (texto === "cadastrartodos"){
        console.log("cadastrando todos os membros");
        const membros = await message.guild.members.fetch();
        membros.forEach(async membro => {
            const usuario = membro.user;
            console.log("cadastrando " + usuario.username);
            const usuarioData = await getUserData(usuario.id);
            if (usuarioData.length === 0){
                await sql.query(`INSERT INTO Pessoas (discord_id, dinheiro, nome) VALUES (${usuario.id}, 0, "${usuario.username}")`);
            }
        });
    }
    if (inicioTexto === "/doar"){
        const valorDoar = parseInt(restoTexto);
        const usuarioDoar = message.mentions.users.first();
        if(!usuarioDoar){return}
        if(isNaN(valorDoar)){return}
        if(valorDoar < 1){return}

        const doadorData = await getUserData(autor.id);
        const recebedorData = await getUserData(usuarioDoar.id);

        if (doadorData.dinheiro < valorDoar){
            message.reply("Você não tem saldo suficiente para doar, pobre");
            return;
        }

        await sql.query(`UPDATE Pessoas SET dinheiro = dinheiro - ${valorDoar} WHERE discord_id = ${autor.id}`);
        await sql.query(`UPDATE Pessoas SET dinheiro = dinheiro + ${valorDoar} WHERE discord_id = ${usuarioDoar.id}`);
        
        message.reply(`Você doou ${valorDoar} reais para ${usuarioDoar.username}\n Seu saldo atual é ${doadorData.dinheiro - valorDoar}`);
    }

    if (inicioTexto === "bonoro23" || texto.substring(0, 8) == "bonoro23" || message.mentions.has(client.user)){
        try{
            const ultimasMensagens = await canal.messages.fetch({ limit: config.maxMessageFetch });
            ultimasMensagens.reverse();
            let ultimasMensagensString = "";
            ultimasMensagens.forEach(mensagem => {
                ultimasMensagensString += `${mensagem.author.username}-${mensagem.author.displayName} : ${mensagem.content} + \n`;
            });

            const prompt = `Você é bonoro23,
            você NÃO é um chatbot,
            você uma entidade do servidor "caderno Music IV",
            você gosta de conversar com as pessoas,
            evite mensagens explicando um tema por completo,
            evite mensagens com mais de 1 paragrafo,
            evite repitir muito as mensagens anteriores,
            use pouca formatação de markdown, 
            aqui está a lista das ultimas mensagens: \n${ultimasMensagensString} \n
            voce tem que responder com sua resposta, exemplo:
            "você é um chatbot" - "não sou um chatbot zoi" \n
            "fale sobre a historia da mongolia" - "não sei nada sobre a mongolia" \n
            essa é a ultima mensagem que você tem que responder ${autor.username} - ${autor.displayName}  : ${restoTexto}`;
            const resposta = await model.generateContent(prompt);
            message.reply(resposta.response.text());
        }catch(e){
            const mensagemErro = `erro: \`\`\`${e.message} ${e.stack}\`\`\``;
            console.log(mensagemErro);
            canal.send(mensagemErro);
        }
    }
});


client.login(process.env.DISCORD_TOKEN);
