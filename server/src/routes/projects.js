const express = require('express');
const { projects } = require('../data/projects');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json(projects);
});

router.get('/:id', (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.status(200).json(project);
});

module.exports = router;
