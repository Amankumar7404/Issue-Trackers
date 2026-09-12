from comments.serializers import CommentSerializer
from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):

    comments = CommentSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "created_at",
            "updated_at",
            "comments",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]
