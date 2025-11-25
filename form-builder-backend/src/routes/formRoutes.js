const express = require('express');
const router = express.Router();
const db = require('../db');

// Rota POST para criar um novo formulário
router.post('/', async (req, res) => {
  // 1. Extraímos 'theme' do corpo da requisição junto com os outros dados
  const { title, description, fields: rawFields, theme } = req.body;

  if (!title || !rawFields) {
    return res.status(400).json({ error: 'Título e a estrutura de campos (fields) são obrigatórios.' });
  }

  let sanitizedFields;
  try {
    // Tenta garantir que rawFields é um objeto e depois serializa para string JSON segura
    // Isso é necessário para o CAST($3 AS JSONB) funcionar perfeitamente com qualquer driver
    let fieldsObject = typeof rawFields === 'string' ? JSON.parse(rawFields) : rawFields;
    sanitizedFields = JSON.stringify(fieldsObject);
  } catch (e) {
    console.error('Erro de parsing JSON:', e);
    return res.status(400).json({ error: 'Formato da estrutura de campos (fields) inválido.' });
  }

  // 2. Preparamos o tema. Se não vier tema (undefined/null), usamos um objeto padrão.
  // O driver 'pg' geralmente lida bem com objetos JS passados para colunas JSONB, 
  // então não precisamos necessariamente de JSON.stringify aqui se não usarmos CAST explícito.
  const sanitizedTheme = theme ? theme : { primaryColor: '#4f46e5', backgroundColor: '#ffffff' };

  try {
    // 3. SQL Atualizado: Incluímos a coluna 'theme' e o placeholder $4.
    // Note que para 'fields' usamos CAST($3 AS JSONB) porque estamos enviando uma string JSON.
    // Para 'theme' ($4), estamos enviando o objeto direto, o driver converte.
    const sql = 'INSERT INTO forms (title, description, fields, theme) VALUES ($1, $2, CAST($3 AS JSONB), $4) RETURNING id';
    
    const params = [title, description, sanitizedFields, sanitizedTheme];

    const result = await db.query(sql, params);

    res.status(201).json({
      message: 'Formulário criado com sucesso!',
      formId: result.rows[0].id
    });
  } catch (error) {
    console.error('Erro ao salvar o formulário no banco de dados:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao processar a requisição.' });
  }
});

// Rota GET para recuperar a estrutura de um formulário específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 4. SQL Atualizado: Adicionado 'theme' na seleção
    const sql = 'SELECT id, title, description, fields, theme FROM forms WHERE id = $1';
    const params = [id];

    const result = await db.query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Formulário não encontrado.' });
    }

    // O PostgreSQL e o driver 'pg' convertem automaticamente colunas JSONB 
    // de volta para objetos JavaScript, então 'fields' e 'theme' já virão como objetos prontos para uso.
    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao buscar o formulário no banco de dados:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar o formulário.' });
  }
});

module.exports = router;