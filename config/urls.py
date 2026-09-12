from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # API status
    path(
        "",
        lambda request: HttpResponse("Issue Tracker API is Running 🚀"),
    ),
    # Admin
    path("admin/", admin.site.urls),
    # Users / Authentication
    path("api/", include("users.urls")),
    # Projects
    path("api/projects/", include("projects.urls")),
    # Tasks
    path("api/tasks/", include("tasks.urls")),
    # Comments
    path("api/comments/", include("comments.urls")),
    # OpenAPI Schema
    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema",
    ),
    # Swagger UI
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
