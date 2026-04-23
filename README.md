# 🏥 City Clinic — AI-Powered Appointment Booking System

A modern, fully responsive clinic website with an integrated AI chatbot that automates patient appointment booking using **Groq (Llama 3.3)** and **n8n workflow automation**.

---

## ✨ Features

- **Professional Landing Page** — Hero, Services, Doctors, and Contact sections
- **AI Chatbot** — Conversational booking assistant powered by Groq's Llama 3.3
- **Smart Data Collection** — Chatbot collects patient name, phone, doctor preference, and appointment date/time
- **n8n Webhook Integration** — Booking data auto-sent to n8n for workflow automation
- **Floating Chat Widget** — Accessible from any section of the website
- **Standalone Chatbot Page** — Full-page booking experience at `chatbot.html`
- **Fully Responsive** — Works on desktop, tablet, and mobile
- **Zero Dependencies** — Pure HTML, CSS, and JavaScript (no frameworks)

---

## 📸 Preview

| Landing Page | AI Chatbot |
|---|---|
| Hero section with stats, services & doctor profiles | Conversational booking flow with success confirmation |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| AI Model | Groq API — `llama-3.3-70b-versatile` (Free tier) |
| Automation | n8n Webhook |
| Fonts | Google Fonts — Inter |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ABHIYANKKUMAR00/clinic-automation-system.git
cd clinic-automation-system
```

### 2. Serve locally

You need a local server (not `file://`) for API calls to work.

**Option A — VS Code Live Server**
- Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
- Right-click `index.html` → **Open with Live Server**

**Option B — Python**
```bash
python -m http.server 8080
```
Then open `http://localhost:8080`

**Option C — Node.js**
```bash
npx serve .
```

### 3. Get a free Groq API key

1. Sign up at [console.groq.com](https://console.groq.com)
2. Go to **API Keys** → Create new key
3. Copy the key (starts with `gsk_...`)

### 4. Configure the chatbot

- Open the website in your browser
- Paste your Groq API key in the input field at the top of the chatbot
- Click **Save Key** and start booking!

---

## 🔁 n8n Webhook Setup

The chatbot sends a POST request to your n8n instance when an appointment is collected.

**Webhook URL:** `http://localhost:5678/webhook/Clinic-Booking`

**Request body:**
```json
{
  "name": "Patient Name",
  "phone": "Phone Number",
  "doctor": "Doctor / Department",
  "datetime": "Preferred Date & Time"
}
```

**To set up n8n:**
```bash
npx n8n
```
Then create a **Webhook** node with path `/Clinic-Booking` and connect your automation flow.

---

## 📁 Project Structure

```
clinic-automation-system/
├── index.html       # Main clinic landing page + embedded chat widget
├── chatbot.html     # Standalone full-page chatbot
├── style.css        # All styles (responsive, animations, theme)
└── script.js        # Chatbot logic (API calls, booking, webhook)
```

---

## 🤖 AI System Prompt

The chatbot uses the following system prompt:

> *"You are a friendly clinic appointment booking assistant for City Clinic. Collect patient name, phone number, doctor/department preference, and preferred date and time. Once all information is collected, respond ONLY with the booking JSON."*

---

## 👨‍⚕️ Doctors Listed

| Doctor | Specialization | Experience |
|---|---|---|
| Dr. Arjun Mehta | Cardiologist | 12 years |
| Dr. Priya Sharma | General Physician | 8 years |
| Dr. Rahul Gupta | Orthopedic Surgeon | 15 years |
| Dr. Sneha Patel | Ophthalmologist | 10 years |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ for City Clinic</p>
