const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/db'); 

// Importação das rotas
const formRoutes = require('./src/routes/formRoutes'); 
const responseRoutes = require('./src/routes/responseRoutes'); // <--- IMPORTANTE

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

app.get('/', (req, res) => { res.send('Servidor Rodando!'); });

// Montagem das rotas
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes); // <--- O Express usará o arquivo que criamos acima

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});