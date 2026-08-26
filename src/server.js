'use strict';
const express = require('express');
const cors = require('cors');
const { body, validationResult, query } = require('express-validator');
const app = express();
app.use(cors()); app.use(express.json());

let tasks = [
  {id:'1',title:'Criar portfólio VibeCoder',description:'25 projetos premium no GitHub',status:'done',priority:'high',tags:['frontend','github'],createdAt:new Date().toISOString()},
  {id:'2',title:'Implementar autenticação JWT',description:'Bcrypt + Refresh Tokens',status:'done',priority:'high',tags:['backend','security'],createdAt:new Date().toISOString()},
  {id:'3',title:'Construir agente de IA',description:'Integração com Gemini API',status:'doing',priority:'high',tags:['ia','gemini'],createdAt:new Date().toISOString()},
];
let nextId = 4;

const genId = () => String(nextId++);
const validate = (req, res, next) => { const errs = validationResult(req); if(!errs.isEmpty()) return res.status(400).json({errors:errs.array()}); next(); };

app.get('/', (req,res) => res.json({service:'Tasks API',version:'1.0.0'}));

// GET /tasks — list with pagination & filters
app.get('/tasks', [
  query('page').optional().isInt({min:1}).toInt(),
  query('limit').optional().isInt({min:1,max:100}).toInt(),
  query('status').optional().isIn(['todo','doing','done']),
  query('priority').optional().isIn(['low','medium','high']),
], validate, (req, res) => {
  let result = [...tasks];
  if(req.query.status) result = result.filter(t => t.status === req.query.status);
  if(req.query.priority) result = result.filter(t => t.priority === req.query.priority);
  if(req.query.search) result = result.filter(t => t.title.toLowerCase().includes(req.query.search.toLowerCase()));
  const total = result.length;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const paginated = result.slice((page-1)*limit, page*limit);
  res.json({data:paginated,pagination:{page,limit,total,pages:Math.ceil(total/limit)}});
});

// POST /tasks
app.post('/tasks', [body('title').trim().notEmpty().isLength({max:200}), body('status').optional().isIn(['todo','doing','done']), body('priority').optional().isIn(['low','medium','high'])], validate, (req,res) => {
  const {title,description='',status='todo',priority='medium',tags=[]} = req.body;
  const task = {id:genId(),title,description,status,priority,tags,createdAt:new Date().toISOString(),updatedAt:null};
  tasks.push(task);
  res.status(201).json(task);
});

// GET /tasks/:id
app.get('/tasks/:id', (req,res) => { const t = tasks.find(t=>t.id===req.params.id); t ? res.json(t) : res.status(404).json({error:'Tarefa não encontrada.'}); });

// PATCH /tasks/:id
app.patch('/tasks/:id', (req,res) => { const i = tasks.findIndex(t=>t.id===req.params.id); if(i===-1) return res.status(404).json({error:'Tarefa não encontrada.'}); tasks[i]={...tasks[i],...req.body,updatedAt:new Date().toISOString()}; res.json(tasks[i]); });

// DELETE /tasks/:id
app.delete('/tasks/:id', (req,res) => { const i = tasks.findIndex(t=>t.id===req.params.id); if(i===-1) return res.status(404).json({error:'Tarefa não encontrada.'}); tasks.splice(i,1); res.status(204).send(); });

app.listen(3000, () => console.log('✅ API Tarefas em http://localhost:3000'));
