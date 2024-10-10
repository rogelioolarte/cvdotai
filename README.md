# CVDOTAI

**CVDOTAI** is a web application designed to analyze resumés and job descriptions. It uses artificial intelligence to provide structured recommendations that help optimize the match between the candidate’s profile and the job requirements.

## Features

- **Resumé Analysis:** Upload your resumé in pdf format, with detailed content analysis.
- **Job Offer Evaluation:** Allows input of a descriptive text of a job offer for analysis.
- **AI-based Recommendations:** Uses the Gemini AI API to compare the résumé with the job offer, generating suggestions on how to improve the candidate's presentation.
- **Modern and User-Friendly Interface:** The application is built with Angular 18 and Angular Material, offering a smooth and intuitive user experience.
- **Robust Backend:** The backend of the application is developed with Django 4, ensuring efficient data management and request processing.

## Technologies

- **Frontend:** Angular 18, Angular Material
- **Backend:** Django 4
- **AI API:** Gemini AI

## Installation and Configuration

### Prerequisites

- Node.js (v16 or higher)
- Angular CLI (v18 or higher)
- Python (v3.8 or higher)
- Django (v4 or higher)
- Gemini AI API Key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/cvdotai.git
   cd cvdotai
   ```

2. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Configuration

1. **Gemini AI API Key:**

   In the backend, make sure to configure your Gemini AI API key in a `.env` file:

   ```bash
   GEMINI_AI_API_KEY=your-api-key
   ```

2. **Database:**

   Configure your database in Django's `settings.py`.

### Running

1. Start the Angular development server:

   ```bash
   cd frontend
   ng serve
   ```

   The application will be available at `http://localhost:4200`.

2. Start the Django server:

   ```bash
   cd backend
   python manage.py runserver
   ```

   The backend will be available at `http://localhost:8000`.

## Usage

1. Upload a resumé in PDF or Word format.
2. Enter the text of the job offer.
3. Receive recommendations to improve the match between the candidate’s profile and the job offer.

## Contributions

Contributions are welcome. Please open an issue or create a pull request to discuss proposed changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
