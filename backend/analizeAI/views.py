import os
import PyPDF2
import logging
from datetime import datetime

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
import google.generativeai as genai

# Configurar logging
logger = logging.getLogger(__name__)

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

@csrf_exempt
def post(request):
    try:
        if request.method != 'POST':
            return HttpResponseBadRequest("Method not allowed. Only POST requests are allowed.")

        if 'resume_pdf' not in request.FILES or 'job_description' not in request.POST:
            return JsonResponse({'error': 'Missing PDF file or job description.'}, status=400)

        pdf_file = request.FILES['resume_pdf']
        job_description = request.POST.get('job_description')

        text_from_pdf = extract_text_from_pdf(pdf_file)
        if(len(text_from_pdf) <= 100):
            return JsonResponse({'error': 'The PDF file does not have valid text or more than 100 characters.'}, status=500)

        genai.configure(api_key=os.environ.get("API_KEY"))
        if not os.environ.get("API_KEY"):
            return JsonResponse({'error': 'API key not found.'}, status=500)

        model = genai.GenerativeModel(
            'gemini-1.5-flash',
            system_instruction="""
                You are an experienced Resume reviewer.
                Your task is to analyze the Resume and Job Description.
                Respond in Spanish.
            """,
            generation_config=genai.GenerationConfig(temperature=0.5),
        )

        response = model.generate_content(f"My Resume: {text_from_pdf}\nJob Description: {job_description}")

        return JsonResponse({'response_text': response.text})

    except KeyError as e:
        logger.error(f"Missing key in request: {str(e)}")
        return JsonResponse({'error': f'An unexpected error occurred, contact the administrator.'}, status=400)

    except PyPDF2.errors.PdfReadError as e:
        logger.error(f"Error processing PDF file: {str(e)}")
        return JsonResponse({'error': f'Error processing PDF file, contact the administrator.'}, status=400)

    except genai.exceptions.APIError as e:
        logger.error(f"Error in Google Generative AI API: {str(e)}")
        return JsonResponse({'error': f'Error with Google Generative AI, contact the administrator.'}, status=500)

    except Exception as e:
        logger.error(f"An unexpected error occurred: {str(e)}")
        return JsonResponse({'error': f'An unexpected error occurred, contact the administrator.'}, status=500)

def extract_text_from_pdf(pdf_file):
    """Función para extraer texto de un archivo PDF"""
    reader = PyPDF2.PdfReader(pdf_file)
    text = ''
    for page_num in range(len(reader.pages)):
        text += reader.pages[page_num].extract_text()
    return text
