# analizeAI/urls.py
from django.urls import path

from analizeAI.views import index
from analizeAI.views import post


urlpatterns = [
    path('', index),
    path("process/", post , name="process_pdf"),
]