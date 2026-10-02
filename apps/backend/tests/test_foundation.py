"""Bootstrap checks only; these do not certify MVP account or authorization behavior."""

from unittest.mock import patch
from uuid import UUID

import pytest
from django.contrib.auth import get_user_model
from django.db import OperationalError
from django.test import Client


def test_live_endpoint(client: Client) -> None:
    response = client.get("/api/v1/health/live", HTTP_HOST="localhost")
    assert response.status_code == 200
    assert response.json()["scope"] == "development-foundation"


def test_live_rejects_post(client: Client) -> None:
    assert client.post("/api/v1/health/live", HTTP_HOST="localhost").status_code == 405


def test_ready_reports_db_failure(client: Client) -> None:
    with patch("innernavi.health.connection.cursor", side_effect=OperationalError):
        response = client.get("/api/v1/health/ready", HTTP_HOST="localhost")
    assert response.status_code == 503
    assert response.json()["code"] == "DATABASE_UNAVAILABLE"


@pytest.mark.django_db
def test_custom_user_is_uuid_and_inactive_by_default() -> None:
    user = get_user_model().objects.create_user(
        username="foundation-test", email="foundation@example.invalid", password=None
    )
    assert isinstance(user.pk, UUID)
    assert user.is_active is False
    assert user.has_usable_password() is False
