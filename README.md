# 🎯 IntelliCense

**IntelliCense** is an AI-powered compliance tool that helps organizations scan and analyze digital content for potential copyright and licensing violations. Leveraging **Retrieval-Augmented Generation (RAG)** and the **Google Gemini API**, IntelliCense delivers real-time legal insights and actionable compliance suggestions based on legal precedents.

---

## 🔍 Key Features

- 🧠 **AI-Powered Scanning**: Detect potential copyright infringement risks in text, images, or videos.
- 📚 **Legal Intelligence**: Retrieve legal precedents and receive recommended compliance actions.
- 🛠️ **Modern Tech Stack**: Built with scalable and maintainable tools for both frontend and backend.
- 🔐 **Secure by Design**: Uses JWT-based authentication to protect your data.

---

## 🧱 Tech Stack

| Layer        | Technologies                             |
|--------------|------------------------------------------|
| **Frontend** | React, TypeScript, Zod                   |
| **Backend**  | Node.js, Express, Prisma, PostgreSQL     |
| **Auth**     | JSON Web Tokens (JWT)                    |
| **AI/ML**    | Google Gemini API, RAG Models            |

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/IntelLicense.git
cd IntelLicense
2. Set up the backend
Configure environment variables (e.g., GROQ_API_KEY, DB credentials)

Install dependencies:

bash
Copy
Edit
cd backend
npm install
Run database migrations:

bash
Copy
Edit
npx prisma migrate dev
Start the server:

bash
Copy
Edit
npm run dev
3. Set up the frontend
Install dependencies:

bash
Copy
Edit
cd frontend
npm install
Start the frontend:

bash
Copy
Edit
npm run dev
🚀 Usage
Open your browser and go to http://localhost:3000

Upload digital content (text, images, videos) to scan.

Review AI-generated compliance suggestions and legal references.

🤝 Contributing
We welcome contributions from the community!

🍴 Fork the repository

🌱 Create a new feature branch (git checkout -b feature/your-feature)

🛠 Make your changes

✅ Test thoroughly

🚀 Submit a pull request

📄 License
This project is licensed under the MIT License.
