from django.contrib import admin
from .models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "task", "author", "content", "created_at")
    search_fields = ("content", "author__username", "task__title")
    ordering = ("-created_at",)
