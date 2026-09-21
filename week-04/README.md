# Partner Referral Assistant

A production prototype built for the **Gayiti Fellowship — Week 4**.

## Problem

Partner-referred leads need to be checked and routed consistently. The process can require validating referral information, extracting lead details, deciding whether the lead qualifies, and generating the appropriate follow-up.

This prototype demonstrates how an AI-powered automation workflow can handle that process from a simple web interface.

## What It Does

The Partner Referral Assistant allows a user to submit a lead request and receive a real-time decision from the connected automation workflow.

The application:

1. Accepts a lead message from the user.
2. Sends the request to a production **n8n webhook**.
3. Uses a multi-agent workflow to:

   * classify the request
   * extract relevant information
   * verify the referral
   * reason about the lead
   * compose the appropriate response
4. Returns the result to the web interface.

The interface displays the decision, next action, and customer response.

This is a **working prototype connected to the live automation workflow**, not a mockup.

## Tech Stack

* React / TypeScript
* Vite
* Tailwind CSS
* n8n
* LLM-powered multi-agent workflow
* Google Sheets for partner/reference data
* Vercel for deployment

## How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/beaucicotduchelinfresnel/partner-lead-aid.git
cd partner-lead-aid
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the environment

Create a `.env` file:

```env
N8N_WEBHOOK_URL=your_n8n_production_webhook_url
```

Do not commit the `.env` file or any credentials to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown by the development server.

## Known Limitations

* This is a production prototype, not a full production SaaS application.
* The prototype currently depends on the connected n8n workflow and its external services.
* Partner/reference data is maintained through the connected Google Sheets workflow.
* Authentication and user accounts are not implemented.
* The AI-generated responses depend on the configured workflow and LLM behavior.
* Error handling is demonstrated at the prototype level and can be expanded for a production system.

## Prototype Architecture

```text
User
  ↓
Web Application
  ↓
Production n8n Webhook
  ↓
Classifier
  ↓
Extractor
  ↓
Reasoner
  ↓
Composer
  ↓
Response
  ↓
Web Application
```

## Gayiti Week 4 Deliverable

This repository contains the working prototype for the **Gayiti Week 4 Production Prototype**.

The application is designed so a non-technical user can open the live application and interact with the workflow without manually operating n8n.

## License

This project was built as a fellowship prototype for Gayiti.

