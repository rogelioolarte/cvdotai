# analizeAI/urls.py
from django.urls import path

from analizeAI.views import index


urlpatterns = [
    path('', index),
]