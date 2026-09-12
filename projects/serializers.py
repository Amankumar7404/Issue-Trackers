from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):

    def validate_title(self, value):

        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters.")

        return value

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]
