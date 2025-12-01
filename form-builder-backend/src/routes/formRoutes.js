const express = require('express');
const router = express.Router();
const db = require('../db');

// Rota GET para LISTAR TODOS os formulários (Dashboard)
// Rota Estática: /api/forms
router.get('/', async (req, res) => {
  try {
    // Seleciona campos essenciais para a listagem
    const sql = 'SELECT id, title, submission_date FROM forms ORDER BY submission_date DESC';
    
    const result = await db.query(sql);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar formulários:', error);
    res.status(500).json({ error: 'Erro interno ao listar formulários.' });
  }
});


// Rota POST para criar um novo formulário
router.post('/', async (req, res) => {
  const { title, description, fields: rawFields, theme } = req.body;

  if (!title || !rawFields) {
    return res.status(400).json({ error: 'Título e a estrutura de campos (fields) são obrigatórios.' });
  }

  let sanitizedFields;
  try {
    let fieldsObject = typeof rawFields === 'string' ? JSON.parse(rawFields) : rawFields;
    sanitizedFields = JSON.stringify(fieldsObject);
  } catch (e) {
    console.error('Erro de parsing JSON:', e);
    return res.status(400).json({ error: 'Formato da estrutura de campos (fields) inválido.' });
  }

  const sanitizedTheme = theme ? theme : { primaryColor: '#4f46e5', backgroundColor: '#ffffff' };

  try {
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


// Rota GET para BUSCAR POR ID (DINÂMICA: /api/forms/:id)
// Esta rota deve vir DEPOIS da rota '/' de listagem
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Adicionado 'theme' na seleção
    const sql = 'SELECT id, title, description, fields, theme FROM forms WHERE id = $1'; 
    const params = [id];

    const result = await db.query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Formulário não encontrado.' });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao buscar o formulário no banco de dados:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar o formulário.' });
  }
});


// Rota PUT para atualizar um formulário existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, fields: rawFields, theme } = req.body;

  if (!title || !rawFields) {
    return res.status(400).json({ error: 'Título e a estrutura de campos (fields) são obrigatórios.' });
  }

  let sanitizedFields;
  try {
    let fieldsObject = typeof rawFields === 'string' ? JSON.parse(rawFields) : rawFields;
    sanitizedFields = JSON.stringify(fieldsObject);
  } catch (e) {
    return res.status(400).json({ error: 'Formato da estrutura de campos (fields) inválido.' });
  }

  try {
    const sql = `
      UPDATE forms
      SET title = $1, description = $2, fields = CAST($3 AS JSONB), theme = $4, submission_date = NOW()
      WHERE id = $5
      RETURNING id;
    `;
    const params = [title, description, sanitizedFields, theme, id];

    const result = await db.query(sql, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Formulário não encontrado para atualização.' });
    }

    res.status(200).json({ message: 'Formulário atualizado com sucesso.', formId: result.rows[0].id });
  } catch (error) {
    console.error('Erro ao atualizar formulário:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar formulário.' });
  }
});


// Rota DELETE para excluir um formulário pelo ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const sql = 'DELETE FROM forms WHERE id = $1 RETURNING id';
    const params = [id];

    const result = await db.query(sql, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Formulário não encontrado para exclusão.' });
    }

    res.status(200).json({ message: 'Formulário e respostas excluídos com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir formulário:', error);
    res.status(500).json({ error: 'Erro interno ao excluir formulário.' });
  }
});


module.exports = router;