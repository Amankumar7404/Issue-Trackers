from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from projects.models import Project
from tasks.models import Task
from .models import Comment

User = get_user_model()


class CommentTests(TestCase):

    def test_user_cannot_create_comment_on_another_users_task(self):
        other_user = User.objects.create_user(
            username="commenttaskowner",
            email="commenttaskowner@example.com",
            password="testpass123",
        )

        other_project = Project.objects.create(
            owner=other_user,
            title="Other Project",
        )

        other_task = Task.objects.create(
            project=other_project,
            created_by=other_user,
            title="Other User Task",
        )

        url = reverse("comments-list")

        response = self.client.post(
            url,
            {
                "task": other_task.id,
                "content": "Unauthorized comment",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Comment.objects.count(),
            0,
        )

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="commentuser",
            email="commentuser@example.com",
            password="testpass123",
        )

        self.project = Project.objects.create(
            owner=self.user,
            title="Comment Project",
        )

        self.task = Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Comment Task",
        )

        self.client.force_authenticate(user=self.user)

    def test_create_comment(self):
        url = reverse("comments-list")

        data = {
            "task": self.task.id,
            "content": "This is a test comment.",
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(Comment.objects.count(), 1)

        comment = Comment.objects.first()

        self.assertEqual(comment.content, "This is a test comment.")
        self.assertEqual(comment.task, self.task)
        self.assertEqual(comment.author, self.user)

    def test_comment_author_is_read_only(self):
        another_user = User.objects.create_user(
            username="anotheruser",
            email="anotheruser@example.com",
            password="testpass123",
        )

        url = reverse("comments-list")

        data = {
            "task": self.task.id,
            "content": "Test author protection.",
            "author": another_user.username,
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        comment = Comment.objects.first()

        self.assertEqual(comment.author, self.user)

    def test_comment_list(self):
        Comment.objects.create(
            task=self.task,
            author=self.user,
            content="Comment One",
        )

        Comment.objects.create(
            task=self.task,
            author=self.user,
            content="Comment Two",
        )

        url = reverse("comments-list")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(response.data["count"], 2)

    def test_unauthenticated_comment_list(self):
        self.client.force_authenticate(user=None)

        url = reverse("comments-list")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_comment_detail(self):
        comment = Comment.objects.create(
            task=self.task,
            author=self.user,
            content="Detail comment",
        )

        url = reverse(
            "comments-detail",
            args=[comment.id],
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            comment.id,
        )

        self.assertEqual(
            response.data["content"],
            "Detail comment",
        )

        self.assertEqual(
            response.data["author"],
            self.user.username,
        )

    def test_comment_update(self):
        comment = Comment.objects.create(
            task=self.task,
            author=self.user,
            content="Old comment",
        )

        url = reverse(
            "comments-detail",
            args=[comment.id],
        )

        response = self.client.patch(
            url,
            {
                "content": "Updated comment",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        comment.refresh_from_db()

        self.assertEqual(
            comment.content,
            "Updated comment",
        )

    def test_comment_delete(self):
        comment = Comment.objects.create(
            task=self.task,
            author=self.user,
            content="Delete comment",
        )

        url = reverse(
            "comments-detail",
            args=[comment.id],
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertEqual(
            Comment.objects.count(),
            0,
        )

    def test_user_can_only_see_own_comments(self):
        other_user = User.objects.create_user(
            username="othercommentuser",
            email="othercomment@example.com",
            password="testpass123",
        )

        other_project = Project.objects.create(
            owner=other_user,
            title="Other Project",
        )

        other_task = Task.objects.create(
            project=other_project,
            created_by=other_user,
            title="Other Task",
        )

        Comment.objects.create(
            task=self.task,
            author=self.user,
            content="My comment",
        )

        Comment.objects.create(
            task=other_task,
            author=other_user,
            content="Other user's comment",
        )

        url = reverse("comments-list")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(response.data["count"], 1)

        self.assertEqual(
            response.data["results"][0]["content"],
            "My comment",
        )

    def test_user_cannot_access_another_users_comment(self):
        other_user = User.objects.create_user(
            username="accessuser",
            email="accessuser@example.com",
            password="testpass123",
        )

        other_project = Project.objects.create(
            owner=other_user,
            title="Access Project",
        )

        other_task = Task.objects.create(
            project=other_project,
            created_by=other_user,
            title="Access Task",
        )

        comment = Comment.objects.create(
            task=other_task,
            author=other_user,
            content="Private comment",
        )

        url = reverse(
            "comments-detail",
            args=[comment.id],
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_user_cannot_update_another_users_comment(self):
        other_user = User.objects.create_user(
            username="updateuser",
            email="updateuser@example.com",
            password="testpass123",
        )

        other_project = Project.objects.create(
            owner=other_user,
            title="Update Project",
        )

        other_task = Task.objects.create(
            project=other_project,
            created_by=other_user,
            title="Update Task",
        )

        comment = Comment.objects.create(
            task=other_task,
            author=other_user,
            content="Original comment",
        )

        url = reverse(
            "comments-detail",
            args=[comment.id],
        )

        response = self.client.patch(
            url,
            {
                "content": "Hacked comment",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        comment.refresh_from_db()

        self.assertEqual(
            comment.content,
            "Original comment",
        )

    def test_unauthenticated_comment_create(self):
        self.client.force_authenticate(user=None)

        url = reverse("comments-list")

        data = {
            "task": self.task.id,
            "content": "Unauthorized comment",
        }

        response = self.client.post(
            url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        self.assertEqual(
            Comment.objects.count(),
            0,
        )

    def test_unauthenticated_comment_detail(self):
        comment = Comment.objects.create(
            task=self.task,
            author=self.user,
            content="Protected comment",
        )

        self.client.force_authenticate(user=None)

        url = reverse(
            "comments-detail",
            args=[comment.id],
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_comment_update(self):
        comment = Comment.objects.create(
            task=self.task,
            author=self.user,
            content="Original comment",
        )

        self.client.force_authenticate(user=None)

        url = reverse(
            "comments-detail",
            args=[comment.id],
        )

        response = self.client.patch(
            url,
            {
                "content": "Unauthorized update",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        comment.refresh_from_db()

        self.assertEqual(
            comment.content,
            "Original comment",
        )

    def test_unauthenticated_comment_delete(self):
        comment = Comment.objects.create(
            task=self.task,
            author=self.user,
            content="Protected comment",
        )

        self.client.force_authenticate(user=None)

        url = reverse(
            "comments-detail",
            args=[comment.id],
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        self.assertTrue(Comment.objects.filter(id=comment.id).exists())

    def test_comment_with_empty_content(self):
        url = reverse("comments-list")

        data = {
            "task": self.task.id,
            "content": "",
        }

        response = self.client.post(
            url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Comment.objects.count(),
            0,
        )
