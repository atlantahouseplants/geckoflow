# GeckoFlow Make.com Scenario Setup Guide

This guide walks you through setting up the complete Make.com automation scenario for GeckoFlow. The scenario receives gecko photos and data from the PWA, uses AI to analyze and generate content, then publishes to GoHighLevel and social media.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Scenario Architecture](#scenario-architecture)
4. [Module-by-Module Setup](#module-by-module-setup)
5. [Claude Prompts](#claude-prompts)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## Overview

### What This Scenario Does

```
PWA Submission → Webhook → Upload Images → AI Analysis → Content Generation →
Publish Listing → Create Social Posts → Return Success to PWA
```

### Payload Structure (from GeckoFlow PWA)

```json
{
  "timestamp": "2026-01-16T14:30:00Z",
  "images": [
    { "order": 1, "base64": "data:image/jpeg;base64,/9j/4AAQ..." },
    { "order": 2, "base64": "data:image/jpeg;base64,/9j/4AAQ..." }
  ],
  "gecko_data": {
    "morph": "Harlequin Pinstripe",
    "sex": "male",
    "weight_grams": 45,
    "hatch_date": "2025-08-15",
    "price": 350,
    "special_notes": "Beautiful red coloring on the dorsal",
    "custom_name": null
  },
  "ai_settings": {
    "tone": "fun",
    "auto_publish": true,
    "create_social_posts": true
  }
}
```

---

## Prerequisites

Before starting, you'll need:

- [ ] **Make.com account** (Team or higher recommended for HTTP modules)
- [ ] **Anthropic API key** - Get from [console.anthropic.com](https://console.anthropic.com)
- [ ] **GoHighLevel account** with API access
- [ ] **GoHighLevel API key** - Found in Settings → Business Profile → API Keys
- [ ] **GoHighLevel Location ID** - Found in Settings → Business Info
- [ ] **Google account** for Sheets logging
- [ ] **Connected social media accounts** in GoHighLevel (Instagram & Facebook)

---

## Scenario Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GECKOFLOW MAKE.COM SCENARIO                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ 1.       │    │ 2.       │    │ 3.       │    │ 4.       │              │
│  │ Webhook  │───▶│ Iterator │───▶│ HTTP     │───▶│ Array    │              │
│  │ Trigger  │    │ (images) │    │ Upload   │    │Aggregator│              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                                         │                    │
│                                                         ▼                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ 8.       │    │ 7.       │    │ 6.       │    │ 5.       │              │
│  │ Google   │◀───│ JSON     │◀───│ HTTP     │◀───│ HTTP     │              │
│  │ Sheets   │    │ Parser   │    │ Claude   │    │ Claude   │              │
│  └──────────┘    └──────────┘    │ Content  │    │ Vision   │              │
│       │                          └──────────┘    └──────────┘              │
│       ▼                                                                      │
│  ┌──────────┐         ┌─────────────────────────────────┐                  │
│  │ 9.       │────────▶│ auto_publish = true?            │                  │
│  │ Router   │         └─────────────────────────────────┘                  │
│  └──────────┘                      │                                        │
│       │                            ▼                                        │
│       │                      ┌──────────┐                                   │
│       │                      │ 10.      │                                   │
│       │                      │ HTTP     │                                   │
│       │                      │ GHL      │                                   │
│       │                      │ Product  │                                   │
│       │                      └──────────┘                                   │
│       ▼                            │                                        │
│  ┌──────────┐         ┌─────────────────────────────────┐                  │
│  │ 11.      │────────▶│ create_social_posts = true?     │                  │
│  │ Router   │         └─────────────────────────────────┘                  │
│  └──────────┘                      │                                        │
│       │                    ┌───────┴───────┐                                │
│       │                    ▼               ▼                                │
│       │              ┌──────────┐    ┌──────────┐                          │
│       │              │ 12.      │    │ 13.      │                          │
│       │              │ HTTP     │    │ HTTP     │                          │
│       │              │ Instagram│    │ Facebook │                          │
│       │              └──────────┘    └──────────┘                          │
│       │                    │               │                                │
│       │                    └───────┬───────┘                                │
│       ▼                            ▼                                        │
│  ┌──────────────────────────────────────────┐                              │
│  │ 14. Webhook Response                      │                              │
│  │     Return success + listing URL to PWA   │                              │
│  └──────────────────────────────────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Module-by-Module Setup

### Module 1: Webhook (Trigger)

**Purpose:** Receives the submission from GeckoFlow PWA

#### Configuration

1. Click **"+"** to add first module
2. Search for **"Webhooks"** → Select **"Custom webhook"**
3. Click **"Add"** to create a new webhook
4. Name it: `GeckoFlow Submission`
5. Click **"Save"**
6. Copy the webhook URL (looks like `https://hook.us1.make.com/xxx...`)
7. Add this URL to your Vercel environment variable `VITE_WEBHOOK_URL`

#### Screenshot Description
```
┌─────────────────────────────────────────┐
│ Webhooks - Custom webhook               │
├─────────────────────────────────────────┤
│ Webhook name: GeckoFlow Submission      │
│                                         │
│ Webhook URL:                            │
│ https://hook.us1.make.com/kd19pn6b...   │
│ [Copy to clipboard]                     │
│                                         │
│ Data structure: [Redetermine]           │
└─────────────────────────────────────────┘
```

#### Determine Data Structure

After adding the webhook, you need to define its data structure:

1. Click **"Redetermine data structure"**
2. Send a test submission from GeckoFlow PWA
3. Make.com will automatically detect the structure

---

### Module 2: Iterator

**Purpose:** Loop through the images array to upload each one

#### Configuration

1. Add module: **Flow Control** → **Iterator**
2. Connect it to the Webhook module
3. Set **Array** to: `{{1.images}}`

#### Screenshot Description
```
┌─────────────────────────────────────────┐
│ Iterator                                │
├─────────────────────────────────────────┤
│ Array: {{1.images}}                     │
│                                         │
│ This will iterate through each image    │
│ in the images array from the webhook    │
└─────────────────────────────────────────┘
```

---

### Module 3: HTTP - Upload Image to GoHighLevel

**Purpose:** Convert base64 to file and upload to GHL Media Library

#### Configuration

1. Add module: **HTTP** → **Make a request**
2. Connect to Iterator

#### Settings

| Field | Value |
|-------|-------|
| **URL** | `https://services.leadconnectorhq.com/medias/upload-file` |
| **Method** | `POST` |
| **Headers** | See below |
| **Body type** | `Multipart/form-data` |

#### Headers

| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{YOUR_GHL_API_KEY}}` |
| `Version` | `2021-07-28` |

#### Body Fields (Multipart/form-data)

| Field Name | Field Type | Value |
|------------|------------|-------|
| `file` | File | See base64 conversion below |
| `hosted` | Text | `true` |
| `fileUrl` | Text | (leave empty) |

#### Base64 to File Conversion

For the `file` field, you need to convert base64 to a file:

1. Set field type to **File**
2. For **Data**, use: `{{base64decode(replace(2.base64; "data:image/jpeg;base64,"; ""))}}`
3. For **File name**, use: `gecko_{{1.timestamp}}_{{2.order}}.jpg`

#### Screenshot Description
```
┌─────────────────────────────────────────┐
│ HTTP - Make a request                   │
├─────────────────────────────────────────┤
│ URL: https://services.leadconnector    │
│      hq.com/medias/upload-file          │
│                                         │
│ Method: POST                            │
│                                         │
│ Headers:                                │
│ ┌─────────────────┬───────────────────┐ │
│ │ Authorization   │ Bearer {{GHL_KEY}}│ │
│ │ Version         │ 2021-07-28        │ │
│ └─────────────────┴───────────────────┘ │
│                                         │
│ Body type: Multipart/form-data          │
│                                         │
│ Fields:                                 │
│ ┌────────┬──────┬─────────────────────┐ │
│ │ file   │ File │ [base64 converted]  │ │
│ │ hosted │ Text │ true                │ │
│ └────────┴──────┴─────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Expected Response

```json
{
  "uploadedFiles": {
    "url": "https://storage.leadconnectorhq.com/media/xxx/gecko_123.jpg",
    "name": "gecko_123.jpg",
    "id": "media_abc123"
  }
}
```

---

### Module 4: Array Aggregator

**Purpose:** Collect all uploaded image URLs into a single array

#### Configuration

1. Add module: **Tools** → **Array aggregator**
2. Connect to HTTP Upload module
3. Set **Source Module** to: `3. HTTP - Upload Image`
4. **Target structure type**: Create new or select "Array of objects"

#### Aggregated Fields

| Field | Value |
|-------|-------|
| `url` | `{{3.data.uploadedFiles.url}}` |
| `order` | `{{2.order}}` |

#### Screenshot Description
```
┌─────────────────────────────────────────┐
│ Array aggregator                        │
├─────────────────────────────────────────┤
│ Source module: 3. HTTP - Upload Image   │
│                                         │
│ Target structure type: Custom           │
│                                         │
│ Aggregated fields:                      │
│ ┌─────────┬───────────────────────────┐ │
│ │ url     │ {{3.data.uploadedFiles... │ │
│ │ order   │ {{2.order}}               │ │
│ └─────────┴───────────────────────────┘ │
│                                         │
│ Group by: (leave empty)                 │
└─────────────────────────────────────────┘
```

---

### Module 5: HTTP - Claude Vision Analysis

**Purpose:** Analyze gecko appearance using Claude's vision capabilities

#### Configuration

1. Add module: **HTTP** → **Make a request**
2. Connect to Array Aggregator

#### Settings

| Field | Value |
|-------|-------|
| **URL** | `https://api.anthropic.com/v1/messages` |
| **Method** | `POST` |
| **Body type** | `Raw` |
| **Content type** | `JSON (application/json)` |

#### Headers

| Key | Value |
|-----|-------|
| `x-api-key` | `{{YOUR_ANTHROPIC_API_KEY}}` |
| `anthropic-version` | `2023-06-01` |
| `content-type` | `application/json` |

#### Request Body (JSON)

```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "url",
            "url": "{{4.array[1].url}}"
          }
        },
        {
          "type": "text",
          "text": "You are an expert crested gecko breeder and morphologist. Analyze this crested gecko photo and provide a detailed description.\n\nDescribe:\n1. **Colors**: Primary and secondary colors, any unique coloring\n2. **Pattern**: Pattern type (harlequin, flame, dalmatian spots, pinstripe, tiger, etc.)\n3. **Structure**: Head structure, crest development, body condition\n4. **Unique Features**: Any standout traits, rare markings, or special characteristics\n5. **Overall Quality**: Assessment of the gecko as a potential breeder or pet\n\nProvide your analysis in a structured format. Be specific about colors (cream, red, orange, yellow, olive, chocolate, etc.) and pattern coverage percentages where applicable."
        }
      ]
    }
  ]
}
```

#### Screenshot Description
```
┌─────────────────────────────────────────┐
│ HTTP - Make a request                   │
├─────────────────────────────────────────┤
│ URL: https://api.anthropic.com/v1/      │
│      messages                           │
│                                         │
│ Method: POST                            │
│                                         │
│ Headers:                                │
│ ┌──────────────────┬──────────────────┐ │
│ │ x-api-key        │ {{ANTHROPIC_KEY}}│ │
│ │ anthropic-version│ 2023-06-01       │ │
│ │ content-type     │ application/json │ │
│ └──────────────────┴──────────────────┘ │
│                                         │
│ Body type: Raw                          │
│ Content type: JSON (application/json)   │
│                                         │
│ Request content: [See JSON above]       │
└─────────────────────────────────────────┘
```

#### Expected Response

```json
{
  "content": [
    {
      "type": "text",
      "text": "## Gecko Analysis\n\n**Colors**: Primary cream/yellow base with vibrant orange and red highlights along the dorsal...\n\n**Pattern**: Classic harlequin pattern with approximately 70% pattern coverage..."
    }
  ]
}
```

---

### Module 6: HTTP - Claude Content Generation

**Purpose:** Generate name, listing description, and social media posts

#### Configuration

1. Add module: **HTTP** → **Make a request**
2. Connect to Claude Vision module

#### Settings

| Field | Value |
|-------|-------|
| **URL** | `https://api.anthropic.com/v1/messages` |
| **Method** | `POST` |
| **Body type** | `Raw` |
| **Content type** | `JSON (application/json)` |

#### Headers

Same as Module 5:

| Key | Value |
|-----|-------|
| `x-api-key` | `{{YOUR_ANTHROPIC_API_KEY}}` |
| `anthropic-version` | `2023-06-01` |
| `content-type` | `application/json` |

#### Request Body (JSON)

```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 2048,
  "messages": [
    {
      "role": "user",
      "content": "You are a creative content writer for a crested gecko breeder. Generate marketing content for a gecko listing.\n\n## Gecko Information\n- **Morph/Genetics**: {{1.gecko_data.morph}}\n- **Sex**: {{1.gecko_data.sex}}\n- **Weight**: {{1.gecko_data.weight_grams}} grams\n- **Hatch Date**: {{1.gecko_data.hatch_date}}\n- **Price**: ${{1.gecko_data.price}}\n- **Special Notes**: {{1.gecko_data.special_notes}}\n- **Custom Name**: {{1.gecko_data.custom_name}}\n\n## Visual Analysis\n{{5.content[1].text}}\n\n## Tone\nWrite in a {{1.ai_settings.tone}} tone.\n- \"fun\" = playful, enthusiastic, uses casual language and occasional puns\n- \"professional\" = informative, detailed, focuses on genetics and breeding quality\n- \"cute\" = adorable, heartwarming, emphasizes personality and cuteness\n\n## Required Output\nRespond with ONLY a valid JSON object (no markdown, no code blocks) in this exact format:\n{\n  \"name\": \"A creative name for this gecko (2-3 words, memorable)\",\n  \"listing_title\": \"Short attention-grabbing title for the listing (under 60 chars)\",\n  \"listing_description\": \"Full product description for the online store (150-250 words). Include appearance, genetics, care level, and what makes this gecko special.\",\n  \"instagram_caption\": \"Instagram post caption with relevant hashtags (under 2200 chars). Include emojis appropriate to the tone.\",\n  \"facebook_post\": \"Facebook post (100-200 words). More conversational, includes call-to-action.\",\n  \"suggested_hashtags\": [\"array\", \"of\", \"relevant\", \"hashtags\"]\n}"
    }
  ]
}
```

#### Screenshot Description
```
┌─────────────────────────────────────────┐
│ HTTP - Make a request                   │
├─────────────────────────────────────────┤
│ URL: https://api.anthropic.com/v1/      │
│      messages                           │
│                                         │
│ Method: POST                            │
│ Headers: [Same as Module 5]             │
│                                         │
│ Body type: Raw                          │
│ Content type: JSON (application/json)   │
│                                         │
│ Request content:                        │
│ [Content generation prompt with         │
│  gecko_data and vision analysis]        │
└─────────────────────────────────────────┘
```

#### Expected Response

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"name\": \"Ember Phoenix\",\n  \"listing_title\": \"Stunning Red Harlequin Pinstripe Male\",\n  \"listing_description\": \"Meet Ember Phoenix, a breathtaking...\",\n  \"instagram_caption\": \"🔥 New arrival alert! 🦎...\",\n  \"facebook_post\": \"We're so excited to introduce...\",\n  \"suggested_hashtags\": [\"crestedgecko\", \"harlequin\", ...]\n}"
    }
  ]
}
```

---

### Module 7: JSON Parser

**Purpose:** Parse Claude's JSON response into usable fields

#### Configuration

1. Add module: **JSON** → **Parse JSON**
2. Connect to Claude Content Generation module

#### Settings

| Field | Value |
|-------|-------|
| **JSON string** | `{{6.content[1].text}}` |

#### Data Structure

Click **"Add"** to create a new data structure, or let Make.com auto-detect. The structure should match:

```json
{
  "name": "string",
  "listing_title": "string",
  "listing_description": "string",
  "instagram_caption": "string",
  "facebook_post": "string",
  "suggested_hashtags": ["array"]
}
```

#### Screenshot Description
```
┌─────────────────────────────────────────┐
│ JSON - Parse JSON                       │
├─────────────────────────────────────────┤
│ JSON string: {{6.content[1].text}}      │
│                                         │
│ Data structure: GeckoContent            │
│ ┌─────────────────────────────────────┐ │
│ │ name: string                        │ │
│ │ listing_title: string               │ │
│ │ listing_description: string         │ │
│ │ instagram_caption: string           │ │
│ │ facebook_post: string               │ │
│ │ suggested_hashtags: array           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### Module 8: Google Sheets - Log Submission

**Purpose:** Create audit trail of all submissions

#### Configuration

1. Add module: **Google Sheets** → **Add a Row**
2. Connect to JSON Parser
3. Connect your Google account if not already connected

#### Settings

| Field | Value |
|-------|-------|
| **Spreadsheet** | Select or create "GeckoFlow Submissions" |
| **Sheet** | Sheet1 |
| **Table contains headers** | Yes |

#### Column Mapping

Create a Google Sheet with these columns, then map:

| Column | Value |
|--------|-------|
| A: Timestamp | `{{1.timestamp}}` |
| B: Morph | `{{1.gecko_data.morph}}` |
| C: Sex | `{{1.gecko_data.sex}}` |
| D: Weight | `{{1.gecko_data.weight_grams}}` |
| E: Price | `{{1.gecko_data.price}}` |
| F: Generated Name | `{{7.name}}` |
| G: Listing Title | `{{7.listing_title}}` |
| H: Status | `Processing` |
| I: Listing URL | (will be updated later) |
| J: Image URLs | `{{join(4.array[].url; ", ")}}` |
| K: Tone | `{{1.ai_settings.tone}}` |
| L: Auto Publish | `{{1.ai_settings.auto_publish}}` |
| M: Social Posts | `{{1.ai_settings.create_social_posts}}` |

#### Screenshot Description
```
┌─────────────────────────────────────────┐
│ Google Sheets - Add a Row               │
├─────────────────────────────────────────┤
│ Connection: [Your Google Account]       │
│                                         │
│ Spreadsheet: GeckoFlow Submissions      │
│ Sheet: Sheet1                           │
│ Table contains headers: Yes             │
│                                         │
│ Values:                                 │
│ ┌───────────────┬─────────────────────┐ │
│ │ Timestamp     │ {{1.timestamp}}     │ │
│ │ Morph         │ {{1.gecko_data...}} │ │
│ │ Sex           │ {{1.gecko_data...}} │ │
│ │ ...           │ ...                 │ │
│ └───────────────┴─────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### Module 9: Router - Check Auto Publish

**Purpose:** Branch workflow based on auto_publish setting

#### Configuration

1. Add module: **Flow Control** → **Router**
2. Connect to Google Sheets module

#### Route 1: Auto Publish Enabled

- **Label**: "Auto Publish"
- **Condition**: `{{1.ai_settings.auto_publish}}` equals `true`

#### Route 2: Skip Publishing (Fallback)

- **Label**: "Skip - Manual Review"
- **Condition**: (no condition - fallback route)

#### Screenshot Description
```
┌─────────────────────────────────────────┐
│ Router                                  │
├─────────────────────────────────────────┤
│ Route 1: Auto Publish                   │
│ Condition: {{1.ai_settings.auto_publish}}│
│            = true                       │
│                                         │
│ Route 2: Skip - Manual Review           │
│ Condition: (fallback)                   │
└─────────────────────────────────────────┘
```

---

### Module 10: HTTP - GoHighLevel Create Product

**Purpose:** Create the product listing in GoHighLevel store

#### Configuration

1. Add module: **HTTP** → **Make a request**
2. Connect to Router (Auto Publish route)

#### Settings

| Field | Value |
|-------|-------|
| **URL** | `https://services.leadconnectorhq.com/products/` |
| **Method** | `POST` |
| **Body type** | `Raw` |
| **Content type** | `JSON (application/json)` |

#### Headers

| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{YOUR_GHL_API_KEY}}` |
| `Version` | `2021-07-28` |
| `Content-Type` | `application/json` |

#### Request Body (JSON)

```json
{
  "locationId": "{{YOUR_GHL_LOCATION_ID}}",
  "name": "{{7.listing_title}}",
  "description": "{{7.listing_description}}",
  "productType": "PHYSICAL",
  "availableInStore": true,
  "medias": {{4.array}},
  "variants": [
    {
      "name": "Default",
      "price": {{1.gecko_data.price}},
      "sku": "GECKO-{{formatDate(1.timestamp; "YYYYMMDD-HHmmss")}}",
      "options": [],
      "inventory": 1
    }
  ]
}
```

#### Screenshot Description
```
┌─────────────────────────────────────────┐
│ HTTP - Make a request                   │
├─────────────────────────────────────────┤
│ URL: https://services.leadconnector    │
│      hq.com/products/                   │
│                                         │
│ Method: POST                            │
│                                         │
│ Headers:                                │
│ ┌─────────────────┬───────────────────┐ │
│ │ Authorization   │ Bearer {{GHL_KEY}}│ │
│ │ Version         │ 2021-07-28        │ │
│ └─────────────────┴───────────────────┘ │
│                                         │
│ Body: [Product creation JSON]           │
└─────────────────────────────────────────┘
```

#### Expected Response

```json
{
  "product": {
    "id": "prod_abc123",
    "name": "Stunning Red Harlequin Pinstripe Male",
    "url": "https://yourstore.com/products/prod_abc123"
  }
}
```

---

### Module 11: Router - Check Social Posts

**Purpose:** Branch workflow based on create_social_posts setting

#### Configuration

1. Add module: **Flow Control** → **Router**
2. Connect to GHL Create Product module

#### Route 1: Create Social Posts

- **Label**: "Create Social Posts"
- **Condition**: `{{1.ai_settings.create_social_posts}}` equals `true`

#### Route 2: Skip Social

- **Label**: "Skip Social"
- **Condition**: (fallback)

---

### Module 12: HTTP - GoHighLevel Instagram Post

**Purpose:** Create Instagram post with generated content

#### Configuration

1. Add module: **HTTP** → **Make a request**
2. Connect to Router (Create Social Posts route)

#### Settings

| Field | Value |
|-------|-------|
| **URL** | `https://services.leadconnectorhq.com/social-media-posting/post` |
| **Method** | `POST` |
| **Body type** | `Raw` |
| **Content type** | `JSON (application/json)` |

#### Headers

| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{YOUR_GHL_API_KEY}}` |
| `Version` | `2021-07-28` |
| `Content-Type` | `application/json` |

#### Request Body (JSON)

```json
{
  "locationId": "{{YOUR_GHL_LOCATION_ID}}",
  "type": "post",
  "accountIds": ["{{YOUR_INSTAGRAM_ACCOUNT_ID}}"],
  "content": "{{7.instagram_caption}}",
  "mediaUrls": ["{{4.array[1].url}}"],
  "scheduledAt": null
}
```

> **Note**: To get your Instagram Account ID, go to GoHighLevel → Marketing → Social Planner → Settings → Connected Accounts

#### Screenshot Description
```
┌─────────────────────────────────────────┐
│ HTTP - Make a request (Instagram)       │
├─────────────────────────────────────────┤
│ URL: https://services.leadconnector    │
│      hq.com/social-media-posting/post   │
│                                         │
│ Method: POST                            │
│                                         │
│ Body:                                   │
│ {                                       │
│   "locationId": "...",                  │
│   "type": "post",                       │
│   "accountIds": ["instagram_id"],       │
│   "content": "{{7.instagram_caption}}", │
│   "mediaUrls": ["{{4.array[1].url}}"]   │
│ }                                       │
└─────────────────────────────────────────┘
```

---

### Module 13: HTTP - GoHighLevel Facebook Post

**Purpose:** Create Facebook post with generated content

#### Configuration

Same as Module 12, but with Facebook account:

#### Request Body (JSON)

```json
{
  "locationId": "{{YOUR_GHL_LOCATION_ID}}",
  "type": "post",
  "accountIds": ["{{YOUR_FACEBOOK_ACCOUNT_ID}}"],
  "content": "{{7.facebook_post}}\n\n🛒 Shop now: {{10.product.url}}",
  "mediaUrls": ["{{4.array[1].url}}"],
  "scheduledAt": null
}
```

---

### Module 14: Webhook Response

**Purpose:** Return success response to GeckoFlow PWA

#### Configuration

1. Add module: **Webhooks** → **Webhook response**
2. Connect to the end of ALL routes (use a final router to merge paths if needed)

#### Settings

| Field | Value |
|-------|-------|
| **Status** | `200` |
| **Body** | See JSON below |

#### Response Body (JSON)

```json
{
  "success": true,
  "gecko_name": "{{7.name}}",
  "listing_title": "{{7.listing_title}}",
  "listing_url": "{{10.product.url}}",
  "morph": "{{1.gecko_data.morph}}",
  "images_uploaded": {{length(4.array)}},
  "social_posts_created": {{1.ai_settings.create_social_posts}},
  "timestamp": "{{now}}"
}
```

#### Screenshot Description
```
┌─────────────────────────────────────────┐
│ Webhooks - Webhook response             │
├─────────────────────────────────────────┤
│ Status: 200                             │
│                                         │
│ Body:                                   │
│ {                                       │
│   "success": true,                      │
│   "gecko_name": "{{7.name}}",           │
│   "listing_title": "{{7.listing_title}}",│
│   "listing_url": "{{10.product.url}}",  │
│   ...                                   │
│ }                                       │
│                                         │
│ Headers:                                │
│ Content-Type: application/json          │
└─────────────────────────────────────────┘
```

---

## Claude Prompts

### Vision Analysis Prompt (Module 5)

```
You are an expert crested gecko breeder and morphologist. Analyze this crested gecko photo and provide a detailed description.

Describe:
1. **Colors**: Primary and secondary colors, any unique coloring
2. **Pattern**: Pattern type (harlequin, flame, dalmatian spots, pinstripe, tiger, etc.)
3. **Structure**: Head structure, crest development, body condition
4. **Unique Features**: Any standout traits, rare markings, or special characteristics
5. **Overall Quality**: Assessment of the gecko as a potential breeder or pet

Provide your analysis in a structured format. Be specific about colors (cream, red, orange, yellow, olive, chocolate, etc.) and pattern coverage percentages where applicable.
```

### Content Generation Prompt (Module 6)

```
You are a creative content writer for a crested gecko breeder. Generate marketing content for a gecko listing.

## Gecko Information
- **Morph/Genetics**: {{morph}}
- **Sex**: {{sex}}
- **Weight**: {{weight}} grams
- **Hatch Date**: {{hatch_date}}
- **Price**: ${{price}}
- **Special Notes**: {{special_notes}}
- **Custom Name**: {{custom_name}}

## Visual Analysis
{{vision_analysis_result}}

## Tone
Write in a {{tone}} tone.
- "fun" = playful, enthusiastic, uses casual language and occasional puns
- "professional" = informative, detailed, focuses on genetics and breeding quality
- "cute" = adorable, heartwarming, emphasizes personality and cuteness

## Required Output
Respond with ONLY a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "name": "A creative name for this gecko (2-3 words, memorable)",
  "listing_title": "Short attention-grabbing title for the listing (under 60 chars)",
  "listing_description": "Full product description for the online store (150-250 words). Include appearance, genetics, care level, and what makes this gecko special.",
  "instagram_caption": "Instagram post caption with relevant hashtags (under 2200 chars). Include emojis appropriate to the tone.",
  "facebook_post": "Facebook post (100-200 words). More conversational, includes call-to-action.",
  "suggested_hashtags": ["array", "of", "relevant", "hashtags"]
}
```

---

## Error Handling

### Recommended Error Handlers

Add error handlers to critical modules:

#### 1. Image Upload Errors (Module 3)

- Add **Error Handler** → **Resume**
- On error, log to Google Sheets with error details
- Continue with remaining images

#### 2. Claude API Errors (Modules 5 & 6)

- Add **Error Handler** → **Break**
- Common errors:
  - `401`: Invalid API key
  - `429`: Rate limited (add delay and retry)
  - `500`: Server error (retry up to 3 times)

#### 3. GHL API Errors (Modules 3, 10, 12, 13)

- Add **Error Handler** → **Rollback**
- On error, update Google Sheets status to "Failed"
- Send error notification email

### Setting Up Error Handler

1. Right-click on a module
2. Select **"Add error handler"**
3. Choose handler type:
   - **Resume**: Continue with next iteration
   - **Break**: Stop scenario, optionally commit previous work
   - **Rollback**: Undo all changes in current cycle
   - **Commit**: Save all changes and stop

### Fallback Webhook Response

Create a final error handler that returns an error response to the PWA:

```json
{
  "success": false,
  "error": "{{error.message}}",
  "timestamp": "{{now}}"
}
```

---

## Testing

### Step 1: Test Webhook

1. Set scenario to **"Run once"** mode
2. Send test from GeckoFlow PWA
3. Verify data structure is detected

### Step 2: Test Individual Modules

1. Run scenario step-by-step using **"Run this module only"**
2. Verify each module's output before connecting to next

### Step 3: Test Complete Flow

1. Use a test gecko image
2. Set `auto_publish: false` initially
3. Verify Google Sheets logging
4. Check Claude responses

### Step 4: Production Testing

1. Enable `auto_publish: true`
2. Create real product listing
3. Verify social media posts
4. Check PWA receives response

### Test Payload

Use this minimal test payload:

```json
{
  "timestamp": "2026-01-16T12:00:00Z",
  "images": [
    {
      "order": 1,
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsLCgwMDQ4PEAwODxMODAoLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q=="
    }
  ],
  "gecko_data": {
    "morph": "Test Harlequin",
    "sex": "unsexed",
    "weight_grams": 30,
    "hatch_date": "2025-06-01",
    "price": 200,
    "special_notes": "Test submission",
    "custom_name": null
  },
  "ai_settings": {
    "tone": "fun",
    "auto_publish": false,
    "create_social_posts": false
  }
}
```

---

## Environment Variables Reference

Store these in Make.com's **"Variables"** or in each module:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `GHL_API_KEY` | GoHighLevel API Key | GHL Settings → Business Profile → API Keys |
| `GHL_LOCATION_ID` | GoHighLevel Location | GHL Settings → Business Info |
| `ANTHROPIC_API_KEY` | Claude API Key | console.anthropic.com → API Keys |
| `INSTAGRAM_ACCOUNT_ID` | Instagram Account in GHL | GHL → Marketing → Social Planner → Settings |
| `FACEBOOK_ACCOUNT_ID` | Facebook Account in GHL | GHL → Marketing → Social Planner → Settings |

---

## Scenario Settings

### Recommended Settings

| Setting | Value |
|---------|-------|
| **Scheduling** | Instant (webhook-triggered) |
| **Max number of cycles** | 1 |
| **Sequential processing** | Yes |
| **Data is confidential** | Yes |

### Execution Limits

- **Operations per execution**: ~15 operations per submission
- **Data transfer**: ~5-10 MB per submission (mainly images)
- **Estimated time**: 30-60 seconds per submission

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Webhook not receiving data | Check CORS settings, verify URL in PWA |
| Base64 conversion fails | Ensure proper prefix stripping |
| Claude returns non-JSON | Add retry logic or adjust prompt |
| GHL upload fails | Check API key permissions, file size limits |
| Social posts not appearing | Verify account connections in GHL |

### Debug Mode

1. Enable **"Show data transfer"** in scenario settings
2. Check **"History"** tab for detailed logs
3. Use **"Incomplete executions"** to review failures

---

## Summary

This scenario automates the complete gecko listing workflow:

1. **Receives** photos and data from GeckoFlow PWA
2. **Uploads** images to GoHighLevel media library
3. **Analyzes** gecko appearance with Claude Vision
4. **Generates** marketing content with Claude
5. **Logs** everything to Google Sheets
6. **Creates** product listing in GoHighLevel
7. **Posts** to Instagram and Facebook
8. **Returns** success response to PWA

Total modules: 14
Estimated cost per run: ~$0.05-0.10 (mainly Claude API)
Average execution time: 30-60 seconds
