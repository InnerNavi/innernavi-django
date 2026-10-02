from django.urls import path
from innernavi.health import live, ready

urlpatterns = [
    path("api/v1/health/live", live),
    path("api/v1/health/ready", ready),
]
