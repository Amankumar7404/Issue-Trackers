from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from users.models import User
from .models import Project


class ProjectCreateTest(APITestCase):

    def test_create_project_unauthenticated(self):

        self.client.force_authenticate(user=None)

        url = reverse("projects-list")

        data = {
            "title": "Unauthorized Project",
            "description": "Should not be created",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        self.assertEqual(
            Project.objects.count(),
            0,
        )

    def test_create_project_with_short_title(self):

        url = reverse("projects-list")

        data = {
            "title": "AB",
            "description": "Invalid project",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Project.objects.count(),
            0,
        )

    def setUp(self):
        self.user = User.objects.create_user(
            username="aman",
            email="aman@test.com",
            password="Aman@123",
        )

        self.client.force_authenticate(user=self.user)

    def test_create_project(self):

        url = reverse("projects-list")

        data = {
            "title": "Issue Tracker",
            "description": "Project management application",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Project.objects.count(),
            1,
        )

        project = Project.objects.get()

        self.assertEqual(
            project.title,
            "Issue Tracker",
        )

        self.assertEqual(
            project.owner,
            self.user,
        )


class ProjectListTest(APITestCase):

    def test_user_can_only_see_own_projects(self):

        other_user = User.objects.create_user(
            username="rahul",
            email="rahul@test.com",
            password="Rahul@123",
        )

        Project.objects.create(
            owner=other_user,
            title="Rahul Project",
            description="Other user's project",
        )

        url = reverse("projects-list")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            2,
        )

        project_titles = [project["title"] for project in response.data["results"]]

        self.assertIn(
            "Project One",
            project_titles,
        )

        self.assertIn(
            "Project Two",
            project_titles,
        )

        self.assertNotIn(
            "Rahul Project",
            project_titles,
        )

    def test_user_cannot_update_another_users_project(self):

        other_user = User.objects.create_user(
            username="rahul",
            email="rahul@test.com",
            password="Rahul@123",
        )

        project = Project.objects.first()

        self.client.force_authenticate(user=other_user)

        url = reverse(
            "projects-detail",
            args=[project.id],
        )

        data = {
            "title": "Hacked Project",
        }

        response = self.client.patch(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        project.refresh_from_db()

        self.assertNotEqual(
            project.title,
            "Hacked Project",
        )

    def test_user_cannot_delete_another_users_project(self):

        other_user = User.objects.create_user(
            username="rahul",
            email="rahul@test.com",
            password="Rahul@123",
        )

        project = Project.objects.first()

        self.client.force_authenticate(user=other_user)

        url = reverse(
            "projects-detail",
            args=[project.id],
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(Project.objects.filter(id=project.id).exists())

    def test_delete_project(self):

        project = Project.objects.first()

        url = reverse(
            "projects-detail",
            args=[project.id],
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertEqual(
            Project.objects.count(),
            1,
        )

    def test_update_project(self):

        project = Project.objects.first()

        url = reverse(
            "projects-detail",
            args=[project.id],
        )

        data = {
            "title": "Updated Project",
            "description": "Updated description",
        }

        response = self.client.patch(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        project.refresh_from_db()

        self.assertEqual(
            project.title,
            "Updated Project",
        )

        self.assertEqual(
            project.description,
            "Updated description",
        )

    def test_get_project_detail(self):

        project = Project.objects.first()

        url = reverse(
            "projects-detail",
            args=[project.id],
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            project.id,
        )

        self.assertEqual(
            response.data["title"],
            project.title,
        )

    def test_get_project_detail_unauthenticated(self):

        self.client.force_authenticate(user=None)

        project = Project.objects.first()

        url = reverse(
            "projects-detail",
            args=[project.id],
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_update_project_unauthenticated(self):

        self.client.force_authenticate(user=None)

        project = Project.objects.first()

        url = reverse(
            "projects-detail",
            args=[project.id],
        )

        data = {
            "title": "Unauthorized Update",
        }

        response = self.client.patch(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        project.refresh_from_db()

        self.assertNotEqual(
            project.title,
            "Unauthorized Update",
        )

    def test_delete_project_unauthenticated(self):

        self.client.force_authenticate(user=None)

        project = Project.objects.first()

        url = reverse(
            "projects-detail",
            args=[project.id],
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        self.assertTrue(Project.objects.filter(id=project.id).exists())

    def test_list_projects_unauthenticated(self):

        self.client.force_authenticate(user=None)

        url = reverse("projects-list")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def setUp(self):
        self.user = User.objects.create_user(
            username="aman",
            email="aman@test.com",
            password="Aman@123",
        )

        self.client.force_authenticate(user=self.user)

        Project.objects.create(
            owner=self.user,
            title="Project One",
            description="First project",
        )

        Project.objects.create(
            owner=self.user,
            title="Project Two",
            description="Second project",
        )

    def test_list_projects(self):

        url = reverse("projects-list")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            2,
        )
