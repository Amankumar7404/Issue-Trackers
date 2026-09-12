from .permissions import IsOwnerOrReadOnly
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Comment
from .serializers import CommentSerializer


class CommentViewSet(viewsets.ModelViewSet):

    serializer_class = CommentSerializer

    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReadOnly,
    ]

    def get_queryset(self):
        return Comment.objects.filter(author=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
