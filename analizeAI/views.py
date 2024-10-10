# analizeAI/views.py
import os
import PyPDF2
from datetime import datetime

from django.http import HttpResponse
from django.http import JsonResponse
import google.generativeai as genai

def index(request):
    now = datetime.now()
    html = f'''
    <html>
        <body>
            <h1>Hello World!</h1>
            <p>The current time is { now }.</p>
        </body>
    </html>
    '''
    return HttpResponse(html)

def post(request):
    # Aquí puedes procesar el archivo PDF y la descripción del trabajo

    # Obtener el archivo PDF y la descripción de la solicitud
    pdf_file = request.FILES['resume_pdf']
    job_description = request.POST.get('job_description')

    # Procesar el PDF
    text_from_pdf = extract_text_from_pdf(pdf_file)

    # Configurar la API de Google Generative AI
    # Coloca tu clave de API aquí
    genai.configure(api_key=os.environ["API_KEY"])

    # Modelo para analizar el CV y la descripción del trabajo
    model = genai.GenerativeModel(
        'gemini-1.5-flash',
        system_instruction="""
            You are an experienced Resume reviewer.
            Your task is to analyze the Resume and Job Description.
            Respond in Spanish.
        """,
        generation_config=genai.GenerationConfig(temperature=0.5),
    )

    # Generar la respuesta basada en el CV y la descripción del trabajo
    response = model.generate_content(f"My Resume: {text_from_pdf}\nJob Description: {job_description}")

    # Enviar el texto generado como respuesta en vez de guardarlo en un archivo
    return JsonResponse({ 'response_text': response.text })

def extract_text_from_pdf(pdf_file):
    """Función para extraer texto de un archivo PDF"""
    reader = PyPDF2.PdfReader(pdf_file)
    text = ''
    for page_num in range(len(reader.pages)):
        text += reader.pages[page_num].extract_text()
    return text
