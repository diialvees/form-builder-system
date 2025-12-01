const express = require('express');
const router = express.Router();
const db = require('../db');
const { Parser } = require('json2csv');

// 1. Rota POST para salvar respostas (VALIDADA!)
router.post('/:formId', async (req, res) => {
  const { formId } = req.params;
  const { data } = req.body; 

  console.log(`[responseRoutes] Salvando resposta para Form ID: ${formId}`);

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Os dados de resposta são obrigatórios.' });
  }

  try {
    const sql = 'INSERT INTO responses (form_id, data) VALUES ($1, $2) RETURNING id';
    const params = [formId, data]; 

    const result = await db.query(sql, params);

    res.status(201).json({ 
        message: 'Respostas salvas com sucesso!', 
        responseId: result.rows[0].id 
    });
  } catch (error) {
    console.error('Erro ao salvar as respostas:', error);
    res.status(500).json({ error: 'Erro interno ao salvar as respostas.' });
  }
});

// 2. Rota GET para exportar CSV (Necessária para o Dashboard)
router.get('/:formId', async (req, res) => {
  const { formId } = req.params;

  try {
    // Busca estrutura do formulário
    const formResult = await db.query('SELECT title, fields FROM forms WHERE id = $1', [formId]);
    if (formResult.rows.length === 0) return res.status(404).json({ error: 'Formulário não encontrado.' });
    
    const form = formResult.rows[0];
    
    // Busca respostas
    const responsesResult = await db.query('SELECT id, data, submission_date FROM responses WHERE form_id = $1 ORDER BY submission_date ASC', [formId]);
    const responses = responsesResult.rows;

    if (responses.length === 0) return res.status(200).send('Nenhuma resposta encontrada.');

    // Prepara CSV
    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Data', value: 'submission_date' },
      ...form.fields.map(f => ({ label: f.label, value: String(f.id) }))
    ];

    const processedResponses = responses.map(resp => {
      const row = { id: resp.id, submission_date: new Date(resp.submission_date).toLocaleString() };
      form.fields.forEach(f => {
        let val = resp.data[String(f.id)];
        row[String(f.id)] = Array.isArray(val) ? val.join(' | ') : val;
      });
      return row;
    });

    const parser = new Parser({ fields });
    const csv = parser.parse(processedResponses);
    
    const filename = `respostas_${form.title.replace(/[^a-z0-9]/gi, '_')}.csv`;
    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    res.send(csv);

  } catch (error) {
    console.error('Erro CSV:', error);
    res.status(500).json({ error: 'Erro ao gerar CSV' });
  }
});

module.exports = router;