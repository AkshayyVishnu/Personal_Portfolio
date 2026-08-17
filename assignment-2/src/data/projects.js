import jurisnet from '../assets/project-jurisnet.svg';
import fraud from '../assets/project-fraud.svg';
import sms from '../assets/project-sms.svg';

export const projects = [
  {
    id: 'jurisnet',
    title: 'JurisNet - Citation-Faithful Hybrid RAG for Indian Civil Law',
    image: jurisnet,
    alt: 'Document linked to a network graph',
    duration: 'May 2026 - Jun 2026',
    link: 'https://github.com/AkshayyVishnu/JurisNet',
    tech: ['Python', 'Qdrant', 'Neo4j', 'SQLite FTS5', 'Voyage AI', 'Gemini', 'Groq'],
    description:
      'A four-source, intent-routed hybrid retriever for Indian civil law that answers with zero fabricated citations.',
    details: [
      'Engineered a 4-source, intent-routed hybrid retriever (dense, statute-label, BM25, citation graph) with query-adaptive weighted RRF. Ablation improved Recall@10 from 64% to 86%, Recall@20 from 67% to 96%, and MRR by 23% over dense-only RAG.',
      'Designed a legal-aware, 6-granularity chunking pipeline that preserves statutory provisions as atomic units and binding rules with their facts, retaining cross-document legal structure.',
      'Built an LLM-free set-membership citation verifier, guaranteeing 0 fabricated citations across a 50-question evaluation benchmark.',
    ],
  },
  {
    id: 'fraud-detection',
    title: 'Credit Card Fraud Detection',
    image: fraud,
    alt: 'Credit card',
    duration: 'Oct 2025 - Dec 2025',
    link: 'https://github.com/AkshayyVishnu/fraud-detection-microservice',
    tech: ['XGBoost', 'Optuna', 'Stratified K-Fold', 'PR-AUC'],
    description:
      'An end-to-end gradient boosting pipeline for a heavily imbalanced transaction dataset, tuned and calibrated.',
    details: [
      'Developed an end-to-end fraud detection pipeline on a highly imbalanced dataset using XGBoost, achieving 74.3% PR-AUC, outperforming a logistic regression baseline on both precision (80% to 85.3%) and recall (55% to 77.3%).',
      'Optimized hyperparameters with Optuna and GPU acceleration, reducing tuning time by 60% compared to grid search.',
      'Applied 5-fold Stratified K-Fold cross-validation (no shuffling) and isotonic calibration to improve probability estimates.',
    ],
  },
  {
    id: 'sms-fraud-detection',
    title: 'On-Device SMS Fraud & Phishing Detection',
    image: sms,
    alt: 'Phone showing a message behind a shield',
    duration: 'Ongoing',
    link: 'https://github.com/0xMukesh/artemis',
    tech: ['MobileBERT', 'CNN-BiLSTM', 'Bloom Filter', 'On-Device Inference'],
    description:
      'Fully offline, privacy-preserving SMS threat classification running on the handset itself.',
    details: [
      'Researched on-device machine learning for SMS fraud and phishing detection using fine-tuned MobileBERT and a compact CNN-BiLSTM, enabling fully offline, privacy-preserving inference.',
      'Developed a hybrid detection pipeline combining neural models with weighted rule-based heuristics and a Bloom filter domain blocklist to classify messages across multiple fraud categories.',
    ],
  },
];
