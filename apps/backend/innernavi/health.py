"""Local runtime checks. Readiness does not imply product/schema readiness."""

from django.db import DatabaseError, connection
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def live(request: HttpRequest) -> JsonResponse:
    return JsonResponse({"status": "ok", "scope": "development-foundation"})


@require_GET
def ready(request: HttpRequest) -> JsonResponse:
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except DatabaseError:
        return JsonResponse({"status": "unavailable", "code": "DATABASE_UNAVAILABLE"}, status=503)
    return JsonResponse({"status": "ok", "scope": "database-connectivity-only"})
