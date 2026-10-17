from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import Task
from .permissions import IsTaskOwner
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.none()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsTaskOwner]

    filterset_fields = ["status", "priority", "project"]
    search_fields = ["title"]
    ordering_fields = ["created_at", "priority", "due_date"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Task.objects.none()

        return Task.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        project = serializer.validated_data["project"]

        if project.owner != self.request.user:
            raise ValidationError(
                {"project": "You can only create tasks in your own projects."}
            )

        serializer.save(created_by=self.request.user)
