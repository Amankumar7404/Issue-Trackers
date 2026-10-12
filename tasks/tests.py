from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse

from projects.models import Project
from .models import Task

User = get_user_model()


class TaskTests(TestCase):

    def test_task_filter_by_project(self):
        second_project = Project.objects.create(
            owner=self.user,
            title="Second Project",
        )

        Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="First Project Task",
        )

        Task.objects.create(
            project=second_project,
            created_by=self.user,
            title="Second Project Task",
        )

        url = reverse("task-list")

        response = self.client.get(
            url,
            {"project": second_project.id},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

        self.assertEqual(
            response.data["results"][0]["title"],
            "Second Project Task",
        )

    def test_task_ordering_by_due_date(self):
        Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Later Task",
            due_date="2026-08-20",
        )

        Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Earlier Task",
            due_date="2026-08-10",
        )

        url = reverse("task-list")

        response = self.client.get(
            url,
            {"ordering": "due_date"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["results"][0]["title"],
            "Earlier Task",
        )

        self.assertEqual(
            response.data["results"][1]["title"],
            "Later Task",
        )

    def test_task_filter_by_priority(self):
        Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="High Priority Task",
            priority="HIGH",
        )

        Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Low Priority Task",
            priority="LOW",
        )

        url = reverse("task-list")

        response = self.client.get(
            url,
            {"priority": "HIGH"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

        self.assertEqual(
            response.data["results"][0]["title"],
            "High Priority Task",
        )

    def test_task_filter_by_status(self):
        Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Todo Task",
            status="TODO",
        )

        Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Completed Task",
            status="DONE",
        )

        url = reverse("task-list")

        response = self.client.get(
            url,
            {"status": "DONE"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

        self.assertEqual(
            response.data["results"][0]["title"],
            "Completed Task",
        )

    def test_task_search(self):
        Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Login Page",
        )

        Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Dashboard Design",
        )

        url = reverse("task-list")

        response = self.client.get(
            url,
            {"search": "Login"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

        self.assertEqual(
            response.data["results"][0]["title"],
            "Login Page",
        )

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="taskuser",
            email="taskuser@example.com",
            password="testpass123",
        )

        self.project = Project.objects.create(
            owner=self.user,
            title="Test Project",
            description="Test project description",
        )

        self.client.force_authenticate(user=self.user)

    def test_create_task(self):
        url = reverse("task-list")

        data = {
            "project": self.project.id,
            "title": "Test Task",
            "description": "Test task description",
            "status": "TODO",
            "priority": "HIGH",
            "due_date": "2026-08-15",
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)

        task = Task.objects.first()

        self.assertEqual(task.title, "Test Task")
        self.assertEqual(task.created_by, self.user)
        self.assertEqual(task.project, self.project)
        self.assertEqual(task.status, "TODO")
        self.assertEqual(task.priority, "HIGH")
        self.assertEqual(task.due_date, date(2026, 8, 15))

    def test_user_cannot_create_task_in_another_users_project(self):
        other_user = User.objects.create_user(
            username="otherprojectuser",
            email="otherprojectuser@example.com",
            password="testpass123",
        )

        other_project = Project.objects.create(
            owner=other_user,
            title="Other User Project",
            description="Another user's project",
        )

        url = reverse("task-list")

        data = {
            "project": other_project.id,
            "title": "Unauthorized Task",
            "description": "Should not be created",
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
            Task.objects.count(),
            0,
        )

    def test_task_default_status_and_priority(self):
        url = reverse("task-list")

        data = {
            "project": self.project.id,
            "title": "Default Task",
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        task = Task.objects.first()

        self.assertEqual(task.status, "TODO")
        self.assertEqual(task.priority, "MEDIUM")

    def test_task_list(self):
        Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Task One",
        )

        Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Task Two",
        )

        url = reverse("task-list")

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_unauthenticated_task_list(self):
        self.client.force_authenticate(user=None)

        url = reverse("task-list")

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_task_detail(self):
        task = Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Detail Task",
            description="Task details",
            priority="HIGH",
        )

        url = reverse("task-detail", args=[task.id])

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], task.id)
        self.assertEqual(response.data["title"], "Detail Task")
        self.assertEqual(response.data["priority"], "HIGH")

    def test_task_update(self):
        task = Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Old Task",
        )

        url = reverse("task-detail", args=[task.id])

        data = {
            "title": "Updated Task",
            "description": "Updated description",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
        }

        response = self.client.patch(
            url,
            data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        task.refresh_from_db()

        self.assertEqual(task.title, "Updated Task")
        self.assertEqual(task.description, "Updated description")
        self.assertEqual(task.status, "IN_PROGRESS")
        self.assertEqual(task.priority, "HIGH")

    def test_task_delete(self):
        task = Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Delete Task",
        )

        url = reverse("task-detail", args=[task.id])

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

    def test_user_cannot_access_another_users_task(self):
        other_user = User.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="testpass123",
        )

        other_project = Project.objects.create(
            owner=other_user,
            title="Other Project",
            description="Other project",
        )

        task = Task.objects.create(
            project=other_project,
            created_by=other_user,
            title="Other User Task",
        )

        url = reverse("task-detail", args=[task.id])

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_update_another_users_task(self):
        other_user = User.objects.create_user(
            username="otheruser2",
            email="otheruser2@example.com",
            password="testpass123",
        )

        other_project = Project.objects.create(
            owner=other_user,
            title="Other Project",
        )

        task = Task.objects.create(
            project=other_project,
            created_by=other_user,
            title="Original Task",
        )

        url = reverse("task-detail", args=[task.id])

        response = self.client.patch(
            url,
            {
                "title": "Hacked Task",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        task.refresh_from_db()

        self.assertEqual(task.title, "Original Task")

    def test_user_cannot_delete_another_users_task(self):
        other_user = User.objects.create_user(
            username="otherdeleteuser",
            email="otherdeleteuser@example.com",
            password="testpass123",
        )

        other_project = Project.objects.create(
            owner=other_user,
            title="Other Project",
        )

        task = Task.objects.create(
            project=other_project,
            created_by=other_user,
            title="Protected Task",
        )

        url = reverse(
            "task-detail",
            args=[task.id],
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(Task.objects.filter(id=task.id).exists())

    def test_unauthenticated_task_create(self):
        self.client.force_authenticate(user=None)

        url = reverse("task-list")

        data = {
            "project": self.project.id,
            "title": "Unauthorized Task",
            "description": "Should not be created",
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
            Task.objects.count(),
            0,
        )

    def test_unauthenticated_task_detail(self):
        task = Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Protected Task",
        )

        self.client.force_authenticate(user=None)

        url = reverse(
            "task-detail",
            args=[task.id],
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_task_update(self):
        task = Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Original Task",
        )

        self.client.force_authenticate(user=None)

        url = reverse(
            "task-detail",
            args=[task.id],
        )

        response = self.client.patch(
            url,
            {"title": "Unauthorized Update"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        task.refresh_from_db()

        self.assertEqual(
            task.title,
            "Original Task",
        )

    def test_unauthenticated_task_delete(self):
        task = Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Protected Task",
        )

        self.client.force_authenticate(user=None)

        url = reverse(
            "task-detail",
            args=[task.id],
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        self.assertTrue(Task.objects.filter(id=task.id).exists())

    def test_task_pagination(self):
        for i in range(6):
            Task.objects.create(
                project=self.project,
                created_by=self.user,
                title=f"Pagination Task {i + 1}",
            )

        url = reverse("task-list")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            6,
        )

        self.assertEqual(
            len(response.data["results"]),
            5,
        )

        self.assertIsNotNone(
            response.data["next"],
        )

        next_response = self.client.get(response.data["next"])

        self.assertEqual(
            next_response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(next_response.data["results"]),
            1,
        )

        self.assertIsNone(
            next_response.data["next"],
        )

    def test_task_invalid_status(self):
        url = reverse("task-list")

        data = {
            "project": self.project.id,
            "title": "Invalid Status Task",
            "status": "INVALID",
            "priority": "MEDIUM",
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
            Task.objects.count(),
            0,
        )

    def test_task_invalid_priority(self):
        url = reverse("task-list")

        data = {
            "project": self.project.id,
            "title": "Invalid Priority Task",
            "status": "TODO",
            "priority": "INVALID",
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
            Task.objects.count(),
            0,
        )

    def test_task_with_nonexistent_project(self):
        url = reverse("task-list")

        data = {
            "project": 999999,
            "title": "Invalid Project Task",
            "status": "TODO",
            "priority": "MEDIUM",
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
            Task.objects.count(),
            0,
        )

    def test_task_with_empty_title(self):
        url = reverse("task-list")

        data = {
            "project": self.project.id,
            "title": "",
            "status": "TODO",
            "priority": "MEDIUM",
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
            Task.objects.count(),
            0,
        )

    def test_task_with_invalid_due_date(self):
        url = reverse("task-list")

        data = {
            "project": self.project.id,
            "title": "Invalid Date Task",
            "status": "TODO",
            "priority": "MEDIUM",
            "due_date": "not-a-date",
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
            Task.objects.count(),
            0,
        )
