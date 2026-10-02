"""Worker bootstrap only. Processing jobs and retry semantics are not implemented."""

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
app = Celery("innernavi")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
