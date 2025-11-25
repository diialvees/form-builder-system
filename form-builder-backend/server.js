const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/db'); 
const formRoutes = require('./src/routes/formRoutes'); 
const responseRoutes = require('./src/routes/responseRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware 
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000' 
}));

// Rota de Teste
app.get('/', (req, res) => {
    res.send('Servidor do Form Builder está rodando!');
});

// USO DAS ROTAS 
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);


// Inicia o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});