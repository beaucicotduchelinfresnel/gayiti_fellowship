# Partner Referral Assistant

A production prototype built for the **GAYITI Fellowship — Week 4**.

The Partner Referral Assistant demonstrates how an AI-powered workflow can automate the initial processing of partner-referred leads through a simple web interface.

> **Status:** Working production prototype
> **Built with:** React, TypeScript, Tailwind CSS, n8n, LLM-powered agents, Google Sheets, Vercel

---

## 1. Problem

Partner-referred leads need to be processed consistently.

A typical request may require several steps:

* receiving the referral request
* validating partner information
* extracting relevant lead details
* determining whether the referral qualifies
* deciding the appropriate next action
* generating a response for the customer

When these steps are handled manually, the process can become repetitive and inconsistent.

This prototype explores how an AI-powered automation workflow can coordinate these steps behind a simple interface.

---

## 2. Solution

The **Partner Referral Assistant** provides a web interface where a user can submit a lead request.

The application sends the request to a production **n8n webhook**, where a multi-agent workflow processes the request and returns a structured result.

The workflow handles classification, information extraction, referral verification, reasoning, and response composition.

The user receives the resulting decision, next action, and customer-facing response directly in the interface.

This is a **working prototype connected to a live automation workflow**, rather than a static mockup.

---

## 3. What It Does

The current workflow follows this general process:

1. User submits a lead request.
2. The web application sends the request to the production n8n webhook.
3. The workflow classifies the incoming request.
4. Relevant information is extracted.
5. Partner/referral information is verified against the connected reference data.
6. The workflow reasons about the lead and determines the appropriate outcome.
7. A response is composed.
8. The result is returned to the web application.
9. The interface displays the decision, next action, and customer response.

---

## 4. Architecture

```text
┌──────────────────────┐
│        User          │
│  Lead Request Input  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Web Application    │
│ React + TypeScript   │
│    + Tailwind CSS    │
└──────────┬───────────┘
           │
           │ HTTP Request
           ▼
┌──────────────────────┐
│   n8n Production     │
│       Webhook        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Classifier Agent    │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Extractor Agent     │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Referral Verification│
│ / Reference Data     │
│    Google Sheets     │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│   Reasoner Agent     │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│   Composer Agent     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Structured Response  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Web Application    │
│ Decision + Next Step │
│ + Customer Response  │
└──────────────────────┘
```

---

## 5. Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Automation

* n8n
* Production webhook
* Multi-agent LLM workflow

### Data

* Google Sheets for partner/reference data

### Deployment

* Vercel

---

## 6. Project Structure

The main GitHub repository contains the broader GAYITI Fellowship work:

```text
gayiti_fellowship/
│
├── week-01/
├── week-02/
├── week-03/
├── week-04/
│   └── Partner Referral Assistant
├── week-05/
├── ...
├── week-10/
│
├── assets/
│   └── screenshots/
│
├── README.md
└── LICENSE
```

The Week 4 deliverable contains the production prototype and supporting project materials.

---

## 7. Running the Prototype Locally

### Prerequisites

Make sure you have:

* Node.js installed
* npm installed
* access to the required n8n workflow/webhook

### Clone the repository

```bash
git clone https://github.com/beaucicotduchelinfresnel/gayiti_fellowship.git
cd gayiti_fellowship
```

Navigate to the Week 4 project directory containing the application.

### Install dependencies

```bash
npm install
```

### Configure the environment

Create a `.env` file and configure the production n8n webhook:

```env
N8N_WEBHOOK_URL=your_n8n_production_webhook_url
```

Do not commit `.env` files, credentials, API keys, or webhook secrets to GitHub.

### Start the development server

```bash
npm run dev
```

Open the local URL provided by Vite.

---

## 8. Screenshots

Screenshots of the prototype are available in:

```
week-04/screenshots/
```

Recommended screenshots for the deliverable:

### Main Interface

![Partner Referral Assistant](<Screenshot 2026-09-25 221926.png>)

### Processing / Loading State
![Valid Referral](<Screenshot 2026-09-25 222651.png>)


### Result State
![Decision & Next Action](<Screenshot 2026-09-25 222905.png>)


### Error State
![Invalid Referral](<Screenshot 2026-09-25 223114.png>)

![Missing Information](<Screenshot 2026-09-25 223259.png>)
---

## 9. Production Prototype

The prototype is deployed and connected to the production n8n workflow.

**Live application:**
*https://partner-lead-aid.vercel.app/*

The live application allows a non-technical user to interact with the workflow without manually operating n8n.

---

## 10. Known Limitations

This project is a **production prototype**, not a complete production SaaS application.

Current limitations include:

* Authentication and user accounts are not implemented.
* The application depends on the connected n8n workflow and external services.
* Partner/reference data is maintained through the connected Google Sheets workflow.
* AI-generated responses depend on the configured LLM workflow.
* Error handling is implemented at the prototype level and can be expanded.
* The current workflow is designed around the demonstrated referral use case rather than a generalized lead-management platform.
* Production concerns such as authentication, authorization, monitoring, rate limiting, audit logging, and robust observability would need to be addressed before broader deployment.

---

## 11. What I Learned

Building this prototype reinforced several lessons:

### From automation to product

An automation workflow becomes significantly more useful when it is exposed through an interface that a non-technical user can operate.

### Multi-agent workflows require clear responsibilities

Separating classification, extraction, reasoning, and response composition makes the workflow easier to understand and modify than relying on one large prompt for every task.

### Integration is part of the engineering work

The frontend, webhook, AI workflow, reference data, and deployment environment all need to work together. A prototype is only useful when the complete path works.

### Error handling matters

A successful happy path is not enough. The interface also needs to communicate what happens when the workflow fails, receives incomplete information, or returns an unexpected result.

---

## 12. Next Steps

Potential improvements for a production-ready version include:

1. Add authentication and role-based access.
2. Replace prototype-level reference data handling with a dedicated database or structured data service.
3. Add persistent lead history and audit logs.
4. Improve validation and error handling across the workflow.
5. Add workflow monitoring and observability.
6. Add automated tests for frontend and workflow behavior.
7. Improve AI evaluation and response reliability.
8. Add analytics around lead processing and outcomes.
9. Harden the webhook and external integrations for production use.

---

## 13. GAYITI Fellowship — Week 4

This project was built as the **Week 4 Production Prototype** for the GAYITI Fellowship.

The goal was to move from individual workflow components toward a working product surface that a non-technical user could open, interact with, and evaluate.

---

## License

This project was built as a fellowship prototype for GAYITI.
