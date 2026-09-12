from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Task
from .serializers import TaskSerializer
from .permissions import IsTaskOwner


class TaskViewSet(viewsets.ModelViewSet):

    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsTaskOwner]

    filterset_fields = [
        "status",
        "priority",
        "project",
    ]

    search_fields = [
        "title",
    ]

    ordering_fields = [
        "created_at",
        "priority",
        "due_date",
    ]

    def get_queryset(self):
        return Task.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
