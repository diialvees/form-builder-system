// src/routes/responseRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { Parser } = require('json2csv');

// --------------------------------------------------------------------------
// Rota POST para submeter as respostas de um formulário
// Recebe: { data: Object }
// URL: /api/responses/:formId
// --------------------------------------------------------------------------
router.post('/:formId', async (req, res) => {
  const { formId } = req.params;
  const { data } = req.body; 

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Os dados de resposta são obrigatórios e devem ser um objeto JSON.' });
  }

  try {
    // O driver PG deve ser capaz de salvar o objeto 'data' diretamente no campo JSONB.
    const sql = 'INSERT INTO responses (form_id, data) VALUES ($1, $2) RETURNING id';
    const params = [formId, data]; 

    const result = await db.query(sql, params);

    res.status(201).json({ 
        message: 'Respostas salvas com sucesso!', 
        responseId: result.rows[0].id 
    });
  } catch (error) {
    // Se o formId não existir (violação da Foreign Key), o erro será capturado aqui.
    console.error('Erro ao salvar as respostas:', error);
    res.status(500).json({ error: 'Erro interno ao salvar as respostas.' });
  }
});

// --------------------------------------------------------------------------
// Rota GET para exportar todas as respostas de um formulário para CSV
// URL: /api/responses/:formId
// --------------------------------------------------------------------------
router.get('/:formId', async (req, res) => {
  const { formId } = req.params;

  try {
    // 1. Buscar a estrutura do formulário para obter os rótulos dos campos
    const formResult = await db.query('SELECT title, fields FROM forms WHERE id = $1', [formId]);
    
    if (formResult.rows.length === 0) {
      return res.status(404).json({ error: 'Formulário não encontrado.' });
    }
    
    const form = formResult.rows[0];
    const fieldStructure = form.fields;

    // 2. Buscar todas as respostas para este formulário
    // Nota: Adicionei 'id' no SELECT para garantir que o mapeamento abaixo funcione
    const responsesResult = await db.query('SELECT id, data, submission_date FROM responses WHERE form_id = $1 ORDER BY submission_date ASC', [formId]);
    const responses = responsesResult.rows;

    if (responses.length === 0) {
      return res.status(200).send('Nenhuma resposta encontrada para este formulário.');
    }

    // 3. Preparar dados para exportação

    // Mapear os rótulos dos campos para serem usados como cabeçalhos (fields) no CSV
    // A chave do campo (field.id) é usada como o nome da coluna de dados no 'data'
    const dbFieldIds = fieldStructure.map(field => String(field.id));
    
    // Adicionar colunas padrão e as chaves dos campos dinâmicos
    const fields = [
      { label: 'ID Resposta', value: 'id' },
      { label: 'Data de Submissão', value: 'submission_date' },
      ...fieldStructure.map(field => ({
        label: field.label, 
        value: String(field.id) // Usa o ID do campo como chave para buscar o valor
      }))
    ];

    // Mapear os dados de resposta para o formato esperado pelo json2csv
    const processedResponses = responses.map(response => {
      // Cria o objeto base com metadata
      const row = {
        id: response.id,
        submission_date: response.submission_date instanceof Date ? response.submission_date.toISOString() : response.submission_date,
      };

      // Adiciona as respostas dinâmicas
      dbFieldIds.forEach(id => {
        let value = response.data[id];
        
        // Trata arrays (usados por checkboxes) unindo os valores com vírgulas
        if (Array.isArray(value)) {
          value = value.join(' | ');
        }
        
        row[id] = value;
      });
      return row;
    });

    // 4. Gerar o CSV
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(processedResponses);

    // 5. Enviar o arquivo como resposta
    // Sanitiza o título para usar no nome do arquivo
    const safeTitle = form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `respostas_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`;
    
    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    res.send(csv);

  } catch (error) {
    console.error('Erro na exportação de respostas:', error);
    res.status(500).json({ error: 'Erro interno ao gerar o arquivo CSV.' });
  }
});

module.exports = router;