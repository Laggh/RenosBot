import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import mysql from 'mysql2/promise';

const sql = await mysql.createConnection({ 
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "DISCORD"
});



const pessoas = {
    marcos: "594528516553310248",
    boltux: "1104560859319107714",
    bonoro: "1026189075344011394",
    lucas : "1169784944315355166"
}
const client = new Client( {intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] } );



client.once('ready', () => {
    console.log('Bot is online!');
    
});

client.on('messageCreate', async message => {
    const texto = message.content.toLowerCase();
    const inicioTexto = texto.split(" ")[0];
    const restoTexto = texto.split(" ").slice(1).join(" ");

    const autor = message.author;
    const canal = message.channel

    if(Math.random() < 1/1000){canal.send('bonoro23')}
    if(message.channelId != "1324573257168584765"){return}
    if(message.author.bot){return}

    console.log(message.author.username + ' : ' + message.content);

    if (texto === "casino"){
        const numero = Math.floor(Math.random() * 100) + 1;
        canal.send(`você ganhou ${numero} reais`);
    }
    if (texto === 'ola bonoro23') {
        canal.send('bonoro23');
    }
    if (texto === "testetts"){
        canal.send('mensagem com TTS', {tts: true});
    }
    if (texto === "testar"){
        console.log(message)
    }
    if (texto === "sql"){
        const [rows, fields] = await sql.execute("SELECT * FROM Pessoas")
        canal.send(JSON.stringify(rows, null, 2));
    }
});


client.login(process.env.DISCORD_TOKEN);