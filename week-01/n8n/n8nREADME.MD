# Referral Partner Program — n8n

## Overview

This workflow automates the intake and processing of partner referrals for an agency.

## Trigger

The workflow starts with a POST Webhook receiving a `partner_code`, prospect information (name, email, phone), and the prospect's intent.

## Data Flow

The workflow first validates that all required fields are present. It then checks the partner code against a Google Sheets Partner Directory and verifies that the partner is active. Valid referrals are written to a Referral Leads Google Sheet with partner attribution, timestamp, prospect details, and intent.

After persistence, the workflow sends notifications to the sales team and sends confirmation and welcome emails to the partner and prospect.

## Edge Case

I handled invalid referrals by checking for missing required fields and unknown or inactive partner codes. These requests are rejected with a clear HTTP 400 error instead of being stored as leads.

## Testing

The workflow was tested with valid partners, an unknown partner code, and missing required fields.